import React, { Component } from 'react';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment';
import { debounce } from 'lodash'
import { convertMarkdown, toggleScrolling } from '../actions/editor';
import { fetchCollectionItem } from '../actions/github';
import Editor from './Editor';
import Preview from './Preview';
import SplitPane from 'react-split-pane';
import Panel from '../components/Panel';
import './edit.css';
import { Menu, Icon, Button, Spin, Layout, Dropdown, Card } from 'antd';
const { Content, Footer } = Layout;

class Edit extends React.Component {
  constructor(props) {
    super(props);
    this.state = { form: {}};
  }

  static propTypes = {
    isScrolling: PropTypes.bool,
    content: PropTypes.string,
    html: PropTypes.string
  };

  componentDidMount() {
    const { site, collection, item } = this.props.match.params;
    this.props.fetchCollectionItem(site, collection, item);
    if (!this.refs.editor || !this.refs.preview) { return; }
    const editor = ReactDom.findDOMNode(this.refs.editor)
    const preview = ReactDom.findDOMNode(this.refs.preview)
    this.onEditorScroll = this.sync(editor, preview, 'editor')
    this.onPreviewScroll = this.sync(preview, editor, 'preview')

    if (this.props.isScrolling) {
      this.bindEvents()
    }
  }

  componentWillReceiveProps(props) {
    if (props.isScrolling) {
      // this.unbindEvents()
      // this.bindEvents()
    } else {
      // this.unbindEvents()
    }
  }

  sync (target, other, scrollingElName) {
    return () => {
      const notScrollingElHandler = scrollingElName === 'preview'
        ? this.onEditorScroll
        : this.onPreviewScroll
      const percentage = (target.scrollTop * 100) / (target.scrollHeight - target.offsetHeight)
      other.removeEventListener('scroll', notScrollingElHandler)
      other.scrollTop = percentage * (other.scrollHeight - other.offsetHeight) / 100
      setTimeout(() => other.addEventListener('scroll', notScrollingElHandler), 20)
    }
  }

  bindEvents = () => {
    ReactDom.findDOMNode(this.refs.editor).addEventListener('scroll', this.onEditorScroll)
    ReactDom.findDOMNode(this.refs.preview).addEventListener('scroll', this.onPreviewScroll)
  }

  unbindEvents = () => {
    ReactDom.findDOMNode(this.refs.editor).removeEventListener('scroll', this.onEditorScroll)
    ReactDom.findDOMNode(this.refs.preview).removeEventListener('scroll', this.onPreviewScroll)
  }

  onChange = (value) => {
    if (this.debouncedChange) {
      this.debouncedChange(value)
    } else {
      this.debouncedChange = debounce(this.props.convertMarkdown, 10)
      this.debouncedChange(value)
    }
  }

  toggleScrolling = () => {
    this.props.toggleScrolling()
  }

  onFormChange = (key, val) => {
    const { form } = this.state;
    form[key] = val;
    this.setState({ form });
  }

  static defaultProps = {
    loading: true,
  };

  handleMenuClick(e) {
    console.log('click', e);
  }

  menu = (
    <Menu onClick={this.handleMenuClick}>
      <Menu.Item key="1">Unpublish</Menu.Item>
      <Menu.Item key="2">Save as Draft</Menu.Item>
      <Menu.Item key="3">Publish</Menu.Item>
    </Menu>
  );

  renderToolbar = () => (
    <div>
      <Button>H1</Button>
      <Button>H2</Button>
      <Button>H3</Button>
      <Button><strong>B</strong></Button>
      <Button><i>i</i></Button>
    </div>
  )

  render() {
    const { wordCount, markdown, html, filePath } = this.props
    const { match, content, loading, meta = {} } = this.props;
    const { form } = this.state;
    if (loading && !!meta && !!markdown) { return <Spin style={{position: 'fixed', top: '50%', left: '50%'}} />; }
    return (
      <Layout className="edit-layout">
        <Content className="edit-container" style={{height: '100%', flexDirection: 'column', display: 'flex'}}>
          <input
            type="text"
            defaultValue={meta.title}
            value={form.title}
            onChange={e => this.onFormChange('title', e.target.value)}
            className="input-title"
          />
          <div className="edit-header">
            <span>{filePath}</span>
            <span>word count: {wordCount}</span>
          </div>
          <div style={{position: 'relative', flex: 1}}>
            <SplitPane split='vertical' defaultSize='50%' primary='second'>
              <Panel ref='editor'>
                <Editor value={markdown} onChange={this.onChange} />
              </Panel>
              <Panel ref='preview' overflowY>
                <Preview value={html} />
              </Panel>
            </SplitPane>
          </div>
          <Footer className="footer">
              {this.renderToolbar()}
              <div>
                <Button className="footer-cta">Edit Meta Data</Button>
                <Dropdown overlay={this.menu} placement="topRight">
                  <Button className="footer-cta footer-cta-publish">
                    Publish <Icon type="down" />
                  </Button>
                </Dropdown>
              </div>
          </Footer>
        </Content>
      </Layout>
    );
  }
}

export default connect(state => ({
  ...state.markdown,
  loading: state.collections.loading,
  meta: state.collections.activeItem.meta,
}), { fetchCollectionItem, convertMarkdown, toggleScrolling })(withRouter(Edit));
