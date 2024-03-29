import { combineReducers } from 'redux';
import user from './user';
import flash from './flash';
import repos from './repos';
import sites from './sites';
import branches from './branches';
import collections from './collections';
import markdown from './markdown';
import editor from './editor';

const rootReducer = combineReducers({
  user,
  flash,
  repos,
  sites,
  branches,
  collections,
  markdown,
  editor
});

export default rootReducer;
