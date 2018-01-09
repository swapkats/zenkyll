import { combineReducers } from 'redux';
import user from './user';
import flash from './flash';
import repos from './repos';
import sites from './sites';
import branches from './branches';

const rootReducer = combineReducers({
  user,
  flash,
  repos,
  sites,
  branches,
});

export default rootReducer;
