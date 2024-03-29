import LocalForage from 'localforage';
import { Base64 } from 'js-base64';
import { uniq, initial, last, get, find } from 'lodash';
import { filterPromises, resolvePromiseProperties } from '../promiseHelper';
import semaphore from 'semaphore';
import jsyaml from 'js-yaml';
// import AssetProxy from "../valueObjects/AssetProxy";
// import { SIMPLE, EDITORIAL_WORKFLOW, status } from "Constants/publishModes";
// import APIError from '../valueObjects/errors';
import { fileExtension } from '../pathHelper';


const APIError = window.Error;
const CMS_BRANCH_PREFIX = 'jekyll_press/';
const MAX_CONCURRENT_DOWNLOADS = 10;

export default class API {
  constructor(config) {
    this.api_root = config.api_root || 'https://api.github.com';
    this.token = config.token || false;
    this.branch = config.branch || 'master';
    this.repo = config.repo || '';
    this.repoURL = `/repos/${this.repo}`;
  }

  getEntriesByFolder(folder, extension = 'md') {
    return this.listFiles(folder)
      .then(files => files.filter(file => fileExtension(file.name) === extension))
      .then((files) => this.fetchFiles(this, files));
  }

  getEntriesByFile(filePath) {
    return new Promise((resolve, reject) => {
      this.readFile(filePath).then((res) => {
        const data = this.parseMetaData(res);
        resolve({ filePath, meta: data.metadata, content: data.content });
      }).catch((err) => {
        reject(err);
      });
    });
  }

  user() {
    return this.request('/user');
  }

  fetchRepos(url) {
    return this.request(url || '/user/repos');
  }

  fetchBranches(user, repo) {
    return this.request(`/repos/${user}/${repo}/branches`);
  }

  hasWriteAccess() {
    return this.request(this.repoURL)
      .then(repo => repo.permissions.push)
      .catch((error) => {
        console.error('Problem fetching repo data from GitHub');
        throw error;
      });
  }

  requestHeaders(headers = {}) {
    const baseHeader = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (this.token) {
      baseHeader.Authorization = `token ${this.token}`;
      return baseHeader;
    }

    return baseHeader;
  }

  parseJsonResponse(response) {
    return response.json().then((json) => {
      if (!response.ok) {
        return Promise.reject(json);
      }

      return json;
    });
  }

  urlFor(path, options) {
    const cacheBuster = new Date().getTime();
    const params = [`ts=${cacheBuster}`];
    if (options.params) {
      for (const key in options.params) {
        params.push(`${key}=${encodeURIComponent(options.params[key])}`);
      }
    }
    if (params.length) {
      path += `?${params.join('&')}`;
    }
    return this.api_root + path;
  }

  request(path, options = {}) {
    const headers = this.requestHeaders(options.headers || {});
    const url = this.urlFor(path, options);
    let responseStatus;
    return fetch(url, { ...options, headers }).then((response) => {
      responseStatus = response.status;
      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.match(/json/)) {
        return this.parseJsonResponse(response);
      }
      return response.text();
    })
      .catch((error) => {
        throw new APIError(error.message, responseStatus, 'GitHub');
      });
  }

  generateBranchName(basename) {
    return `${CMS_BRANCH_PREFIX}${basename}`;
  }

  checkMetadataRef() {
    return this.request(`${this.repoURL}/git/refs/meta/jekyll_press?${Date.now()}`, {
      cache: 'no-store',
    })
      .then(response => response.object)
      .catch((error) => {
      // Meta ref doesn't exist
        const readme = {
          raw: '# Netlify CMS\n\nThis tree is used by the Netlify CMS to store metadata information for specific files and branches.',
        };

        return this.uploadBlob(readme)
          .then(item => this.request(`${this.repoURL}/git/trees`, {
            method: 'POST',
            body: JSON.stringify({
              tree: [{
                path: 'README.md', mode: '100644', type: 'blob', sha: item.sha,
              }],
            }),
          }))
          .then(tree => this.commit('First Commit', tree))
          .then(response => this.createRef('meta', 'jekyll_press', response.sha))
          .then(response => response.object);
      });
  }

  storeMetadata(key, data) {
    return this.checkMetadataRef()
      .then((branchData) => {
        const fileTree = {
          [`${key}.json`]: {
            path: `${key}.json`,
            raw: JSON.stringify(data),
            file: true,
          },
        };

        return this.uploadBlob(fileTree[`${key}.json`])
          .then(item => this.updateTree(branchData.sha, '/', fileTree))
          .then(changeTree => this.commit(`Updating “${key}” metadata`, changeTree))
          .then(response => this.patchRef('meta', '_', response.sha))
          .then(() => {
            LocalForage.setItem(`gh.meta.${key}`, {
              expires: Date.now() + 300000, // In 5 minutes
              data,
            });
          });
      });
  }

  retrieveMetadata(key) {
    const cache = LocalForage.getItem(`gh.meta.${key}`);
    return cache.then((cached) => {
      if (cached && cached.expires > Date.now()) { return cached.data; }
      console.log("%c Checking for MetaData files", "line-height: 30px;text-align: center;font-weight: bold"); // eslint-disable-line
      return this.request(`${this.repoURL}/contents/${key}.json`, {
        params: { ref: 'refs/meta/jekyll_press' },
        headers: { Accept: 'application/vnd.github.VERSION.raw' },
        cache: 'no-store',
      })
        .then(response => JSON.parse(response))
      .catch(error => console.log("%c %s does not have metadata", "line-height: 30px;text-align: center;font-weight: bold", key)); // eslint-disable-line
    });
  }

  readFile(path, sha, branch = this.branch) {
    const cache = sha ? LocalForage.getItem(`gh.${sha}`) : Promise.resolve(null);
    return cache.then((cached) => {
      if (cached) { return cached; }

      return this.request(`${this.repoURL}/contents/${path}`, {
        headers: { Accept: 'application/vnd.github.VERSION.raw' },
        params: { ref: branch },
        cache: 'no-store',
      }).then((result) => {
        if (sha) {
          LocalForage.setItem(`gh.${sha}`, result);
        }
        return result;
      });
    });
  }

  parseMetaData(resp, options) {
    // Extract YAML from a post, trims whitespace
    resp = resp
      .replace(/\r\n/g, '\n') // normalize a little bit
      .replace(/\s*$/, '\n'); // trim (or append) so that EOF has exactly one \n

    // var hasMetadata = !!util.hasMetadata(resp);
    //
    // if (!hasMetadata) return {
    //   content: resp,
    //   metadata: false,
    //   previous: resp
    // };

    var res = {
      previous: resp
    };

    res.content = resp.replace(/^(---\n)((.|\n)*?)---\n?/, function(match, dashes, frontmatter) {
      var regex = /published: false/;

      try {
        // TODO: _.defaults for each key
        res.metadata = jsyaml.safeLoad(frontmatter);

        // Default to published unless explicitly set to false
        res.metadata.published = !regex.test(frontmatter);
      } catch(err) {
        console.log('ERROR encoding YAML');
        console.log(err);
      }

      return '';
    });

    return res;

  }

  fetchFiles(self, files) {
    const sem = semaphore(MAX_CONCURRENT_DOWNLOADS);
    const promises = [];
    files.forEach((file) => {
      promises.push(new Promise((resolve, reject) => (
        sem.take(() => self.readFile(file.path, file.sha).then((res) => {
          const data = self.parseMetaData(res);
          resolve({ file, meta: data.metadata, content: data.content });
          sem.leave();
        }).catch((err) => {
          sem.leave();
          reject(err);
        }))
      )));
    });
    return Promise.all(promises);
  }

  listFiles(path) {
    return this.request(`${this.repoURL}/contents/${path.replace(/\/$/, '')}`, {
      params: { ref: this.branch },
    })
      .then((files) => {
        if (!Array.isArray(files)) {
          throw new Error(`Cannot list files, path ${path} is not a directory but a ${files.type}`);
        }
        return files;
      })
      .then(files => files.filter(file => file.type === 'file'));
  }

  readUnpublishedBranchFile(contentKey) {
    const metaDataPromise = this.retrieveMetadata(contentKey)
      .then(data => (data.objects.entry.path ? data : Promise.reject(null)));
    return resolvePromiseProperties({
      metaData: metaDataPromise,
      fileData: metaDataPromise.then(data => this.readFile(data.objects.entry.path, null, data.branch)),
      isModification: metaDataPromise.then(data => this.isUnpublishedEntryModification(data.objects.entry.path, this.branch)),
    })
      .catch(() => {
      // throw new EditorialWorkflowError('content is not under editorial workflow', true);
      });
  }

  isUnpublishedEntryModification(path, branch) {
    return this.readFile(path, null, branch)
      .then(data => true)
      .catch((err) => {
        if (err.message && err.message === 'Not Found') {
          return false;
        }
        throw err;
      });
  }

  listUnpublishedBranches() {
    console.log("%c Checking for Unpublished entries", "line-height: 30px;text-align: center;font-weight: bold"); // eslint-disable-line
    return this.request(`${this.repoURL}/git/refs/heads/cms`)
      .then(branches => filterPromises(branches, (branch) => {
        const branchName = branch.ref.substring('/refs/heads/'.length - 1);

        // Get PRs with a `head` of `branchName`. Note that this is a
        // substring match, so we need to check that the `head.ref` of
        // at least one of the returned objects matches `branchName`.
        return this.request(`${this.repoURL}/pulls`, {
          params: {
            head: branchName,
            state: 'open',
          },
        })
          .then(prs => prs.some(pr => pr.head.ref === branchName));
      }))
      .catch((error) => {
      console.log("%c No Unpublished entries", "line-height: 30px;text-align: center;font-weight: bold"); // eslint-disable-line
        throw error;
      });
  }

  composeFileTree(files) {
    let filename;
    let part;
    let parts;
    let subtree;
    const fileTree = {};

    files.forEach((file) => {
      if (file.uploaded) { return; }
      parts = file.path.split('/').filter(part => part);
      filename = parts.pop();
      subtree = fileTree;
      while (part = parts.shift()) {
        subtree[part] = subtree[part] || {};
        subtree = subtree[part];
      }
      subtree[filename] = file;
      file.file = true;
    });

    return fileTree;
  }

  persistFiles(entry, mediaFiles, options) {
    const uploadPromises = [];
    const files = entry ? mediaFiles.concat(entry) : mediaFiles;

    files.forEach((file) => {
      if (file.uploaded) { return; }
      uploadPromises.push(this.uploadBlob(file));
    });

    const fileTree = this.composeFileTree(files);

    return Promise.all(uploadPromises).then(() =>
      // if (!options.mode || (options.mode && options.mode === SIMPLE)) {
      this.getBranch()
        .then(branchData => this.updateTree(branchData.commit.sha, '/', fileTree))
        .then(changeTree => this.commit(options.commitMessage, changeTree))
        .then(response => this.patchBranch(this.branch, response.sha)),

      // } else if (options.mode && options.mode === EDITORIAL_WORKFLOW) {
      //   const mediaFilesList = mediaFiles.map(file => ({ path: file.path, sha: file.sha }));
      //   return this.editorialWorkflowGit(fileTree, entry, mediaFilesList, options);
      // }
    );
  }

  deleteFile(path, message, options = {}) {
    const branch = options.branch || this.branch;
    const pathArray = path.split('/');
    const filename = last(pathArray);
    const directory = initial(pathArray).join('/');
    const fileDataPath = encodeURIComponent(directory);
    const fileDataURL = `${this.repoURL}/git/trees/${branch}:${fileDataPath}`;
    const fileURL = `${this.repoURL}/contents/${path}`;

    /**
     * We need to request the tree first to get the SHA. We use extended SHA-1
     * syntax (<rev>:<path>) to get a blob from a tree without having to recurse
     * through the tree.
     */
    return this.request(fileDataURL, { cache: 'no-store' })
      .then((resp) => {
        const { sha } = resp.tree.find(file => file.path === filename);
        const opts = { method: 'DELETE', params: { sha, message, branch } };
        return this.request(fileURL, opts);
      });
  }

  /**
   * Rebase a pull request onto the latest HEAD of it's target base branch
   * (should generally be the configured backend branch). Only rebases changes
   * in the entry file.
   */
  async rebasePullRequest(prNumber, branchName, contentKey, metadata, head) {
    const { path } = metadata.objects.entry;

    try {
      /**
       * Get the published branch and create new commits over it. If the pull
       * request is up to date, no rebase will occur.
       */
      const baseBranch = await this.getBranch();
      const commits = await this.getPullRequestCommits(prNumber, head);

      /**
       * Sometimes the list of commits for a pull request isn't updated
       * immediately after the PR branch is patched. There's also the possibility
       * that the branch has changed unexpectedly. We account for both by adding
       * the head if it's missing, or else throwing an error if the PR head is
       * neither the head we expect nor its parent.
       */
      const finalCommits = this.assertHead(commits, head);
      const rebasedHead = await this.rebaseSingleBlobCommits(baseBranch.commit, finalCommits, path);

      /**
       * Update metadata, then force update the pull request branch head.
       */
      const pr = { ...metadata.pr, head: rebasedHead.sha };
      const timeStamp = new Date().toISOString();
      const updatedMetadata = { ...metadata, pr, timeStamp };
      await this.storeMetadata(contentKey, updatedMetadata);
      return this.patchBranch(branchName, rebasedHead.sha, { force: true });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * Rebase an array of commits one-by-one, starting from a given base SHA. Can
   * accept an array of commits as received from the GitHub API. All commits are
   * expected to change the same, single blob.
   */
  rebaseSingleBlobCommits(baseCommit, commits, pathToBlob) {
    /**
     * If the parent of the first commit already matches the target base,
     * return commits as is.
     */
    if (commits.length === 0 || commits[0].parents[0].sha === baseCommit.sha) {
      return Promise.resolve(last(commits));
    }

    /**
     * Re-create each commit over the new base, applying each to the previous,
     * changing only the parent SHA and tree for each, but retaining all other
     * info, such as the author/committer data.
     */
    const newHeadPromise = commits.reduce((lastCommitPromise, commit, idx) => lastCommitPromise.then((newParent) => {
      /**
         * Normalize commit data to ensure it's not nested in `commit.commit`.
         */
      const parent = this.normalizeCommit(newParent);
      const commitToRebase = this.normalizeCommit(commit);

      return this.rebaseSingleBlobCommit(parent, commitToRebase, pathToBlob);
    }), Promise.resolve(baseCommit));

    /**
     * Return a promise that resolves when all commits have been created.
     */
    return newHeadPromise;
  }

  /**
   * Rebase a commit that changes a single blob. Also handles updating the tree.
   */
  rebaseSingleBlobCommit(baseCommit, commit, pathToBlob) {
    /**
     * Retain original commit metadata.
     */
    const { message, author, committer } = commit;

    /**
     * Set the base commit as the parent.
     */
    const parent = [baseCommit.sha];

    /**
     * Get the blob data by path.
     */
    return this.getBlobInTree(commit.tree.sha, pathToBlob)

      /**
       * Create a new tree consisting of the base tree and the single updated
       * blob. Use the full path to indicate nesting, GitHub will take care of
       * subtree creation.
       */
      .then(blob => this.createTree(baseCommit.tree.sha, [{ ...blob, path: pathToBlob }]))

      /**
       * Create a new commit with the updated tree and original commit metadata.
       */
      .then(tree => this.createCommit(message, tree.sha, parent, author, committer));
  }


  /**
   * Get a pull request by PR number.
   */
  getPullRequest(prNumber) {
    return this.request(`${this.repoURL}/pulls/${prNumber} }`);
  }

  /**
   * Get the list of commits for a given pull request.
   */
  getPullRequestCommits(prNumber) {
    return this.request(`${this.repoURL}/pulls/${prNumber}/commits`);
  }

  /**
   * Returns `commits` with `headToAssert` appended if it's the child of the
   * last commit in `commits`. Returns `commits` unaltered if `headToAssert` is
   * already the last commit in `commits`. Otherwise throws an error.
   */
  assertHead(commits, headToAssert) {
    const headIsMissing = headToAssert.parents[0].sha === last(commits).sha;
    const headIsNotMissing = headToAssert.sha === last(commits).sha;

    if (headIsMissing) {
      return commits.concat(headToAssert);
    } else if (headIsNotMissing) {
      return commits;
    }

    throw Error('Editorial workflow branch changed unexpectedly.');
  }

  updateUnpublishedEntryStatus(collection, slug, status) {
    const contentKey = slug;
    return this.retrieveMetadata(contentKey)
      .then(metadata => ({
        ...metadata,
        status,
      }))
      .then(updatedMetadata => this.storeMetadata(contentKey, updatedMetadata));
  }

  deleteUnpublishedEntry(collection, slug) {
    const contentKey = slug;
    const branchName = this.generateBranchName(contentKey);
    return this.retrieveMetadata(contentKey)
      .then(metadata => this.closePR(metadata.pr, metadata.objects))
      .then(() => this.deleteBranch(branchName))
    // If the PR doesn't exist, then this has already been deleted -
    // deletion should be idempotent, so we can consider this a
    // success.
      .catch((err) => {
        if (err.message === 'Reference does not exist') {
          return Promise.resolve();
        }
        return Promise.reject(err);
      });
  }

  publishUnpublishedEntry(collection, slug) {
    const contentKey = slug;
    const branchName = this.generateBranchName(contentKey);
    let prNumber;
    return this.retrieveMetadata(contentKey)
      .then(metadata => this.mergePR(metadata.pr, metadata.objects))
      .then(() => this.deleteBranch(branchName));
  }


  createRef(type, name, sha) {
    return this.request(`${this.repoURL}/git/refs`, {
      method: 'POST',
      body: JSON.stringify({ ref: `refs/${type}/${name}`, sha }),
    });
  }

  patchRef(type, name, sha, opts = {}) {
    const force = opts.force || false;
    return this.request(`${this.repoURL}/git/refs/${type}/${encodeURIComponent(name)}`, {
      method: 'PATCH',
      body: JSON.stringify({ sha, force }),
    });
  }

  deleteRef(type, name, sha) {
    return this.request(`${this.repoURL}/git/refs/${type}/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
  }

  getBranch(branch = this.branch) {
    return this.request(`${this.repoURL}/branches/${encodeURIComponent(branch)}`);
  }

  createBranch(branchName, sha) {
    return this.createRef('heads', branchName, sha);
  }

  assertCmsBranch(branchName) {
    return branchName.startsWith(CMS_BRANCH_PREFIX);
  }

  patchBranch(branchName, sha, opts = {}) {
    const force = opts.force || false;
    if (force && !this.assertCmsBranch(branchName)) {
      throw Error(`Only CMS branches can be force updated, cannot force update ${branchName}`);
    }
    return this.patchRef('heads', branchName, sha, { force });
  }

  deleteBranch(branchName) {
    return this.deleteRef('heads', branchName);
  }

  createPR(title, head, base = this.branch) {
    const body = 'Automatically generated by Netlify CMS';
    return this.request(`${this.repoURL}/pulls`, {
      method: 'POST',
      body: JSON.stringify({
        title, body, head, base,
      }),
    });
  }

  closePR(pullrequest, objects) {
    const headSha = pullrequest.head;
    const prNumber = pullrequest.number;
    console.log("%c Deleting PR", "line-height: 30px;text-align: center;font-weight: bold"); // eslint-disable-line
    return this.request(`${this.repoURL}/pulls/${prNumber}`, {
      method: 'PATCH',
      body: JSON.stringify({
        state: 'closed',
      }),
    });
  }

  mergePR(pullrequest, objects) {
    const headSha = pullrequest.head;
    const prNumber = pullrequest.number;
    console.log("%c Merging PR", "line-height: 30px;text-align: center;font-weight: bold"); // eslint-disable-line
    return this.request(`${this.repoURL}/pulls/${prNumber}/merge`, {
      method: 'PUT',
      body: JSON.stringify({
        commit_message: 'Automatically generated. Merged on Netlify CMS.',
        sha: headSha,
      }),
    })
      .catch((error) => {
        if (error instanceof APIError && error.status === 405) {
          this.forceMergePR(pullrequest, objects);
        } else {
          throw error;
        }
      });
  }

  forceMergePR(pullrequest, objects) {
    const files = objects.files.concat(objects.entry);
    const fileTree = this.composeFileTree(files);
    let commitMessage = 'Automatically generated. Merged on Netlify CMS\n\nForce merge of:';
    files.forEach((file) => {
      commitMessage += `\n* "${file.path}"`;
    });
    console.log("%c Automatic merge not possible - Forcing merge.", "line-height: 30px;text-align: center;font-weight: bold"); // eslint-disable-line
    return this.getBranch()
      .then(branchData => this.updateTree(branchData.commit.sha, '/', fileTree))
      .then(changeTree => this.commit(commitMessage, changeTree))
      .then(response => this.patchBranch(this.branch, response.sha));
  }

  getTree(sha) {
    if (sha) {
      return this.request(`${this.repoURL}/git/trees/${sha}`);
    }
    return Promise.resolve({ tree: [] });
  }

  /**
   * Get a blob from a tree. Requests individual subtrees recursively if blob is
   * nested within one or more directories.
   */
  getBlobInTree(treeSha, pathToBlob) {
    const pathSegments = pathToBlob.split('/').filter(val => val);
    const directories = pathSegments.slice(0, -1);
    const filename = pathSegments.slice(-1)[0];
    const baseTree = this.getTree(treeSha);
    const subTreePromise = directories.reduce((treePromise, segment) => treePromise.then((tree) => {
      const subTreeSha = find(tree.tree, { path: segment }).sha;
      return this.getTree(subTreeSha);
    }), baseTree);
    return subTreePromise.then(subTree => find(subTree.tree, { path: filename }));
  }

  toBase64(str) {
    return Promise.resolve(Base64.encode(str));
  }

  uploadBlob(item) {
    const content = this.base64(item.raw);// item instanceof AssetProxy ? item.toBase64() : this.toBase64(item.raw);

    return content.then(contentBase64 => this.request(`${this.repoURL}/git/blobs`, {
      method: 'POST',
      body: JSON.stringify({
        content: contentBase64,
        encoding: 'base64',
      }),
    }).then((response) => {
      item.sha = response.sha;
      item.uploaded = true;
      return item;
    }));
  }

  updateTree(sha, path, fileTree) {
    return this.getTree(sha)
      .then((tree) => {
        let obj;
        let filename;
        let fileOrDir;
        const updates = [];
        const added = {};

        for (let i = 0, len = tree.tree.length; i < len; i++) {
          obj = tree.tree[i];
          if (fileOrDir = fileTree[obj.path]) {
            added[obj.path] = true;
            if (fileOrDir.file) {
              updates.push({
                path: obj.path, mode: obj.mode, type: obj.type, sha: fileOrDir.sha,
              });
            } else {
              updates.push(this.updateTree(obj.sha, obj.path, fileOrDir));
            }
          }
        }
        for (filename in fileTree) {
          fileOrDir = fileTree[filename];
          if (added[filename]) { continue; }
          updates.push(fileOrDir.file ?
            {
              path: filename, mode: '100644', type: 'blob', sha: fileOrDir.sha,
            } :
            this.updateTree(null, filename, fileOrDir));
        }
        return Promise.all(updates)
          .then(tree => this.createTree(sha, tree))
          .then(response => ({
            path, mode: '040000', type: 'tree', sha: response.sha, parentSha: sha,
          }));
      });
  }

  createTree(baseSha, tree) {
    return this.request(`${this.repoURL}/git/trees`, {
      method: 'POST',
      body: JSON.stringify({ base_tree: baseSha, tree }),
    });
  }

  /**
   * Some GitHub API calls return commit data in a nested `commit` property,
   * with the SHA outside of the nested property, while others return a
   * flatter object with no nested `commit` property. This normalizes a commit
   * to resemble the latter.
   */
  normalizeCommit(commit) {
    if (commit.commit) {
      return { ...commit.commit, sha: commit.sha };
    }
    return commit;
  }

  commit(message, changeTree) {
    const parents = changeTree.parentSha ? [changeTree.parentSha] : [];
    return this.createCommit(message, changeTree.sha, parents);
  }

  createCommit(message, treeSha, parents, author, committer) {
    return this.request(`${this.repoURL}/git/commits`, {
      method: 'POST',
      body: JSON.stringify({
        message, tree: treeSha, parents, author, committer,
      }),
    });
  }
}
