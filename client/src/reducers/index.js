import { combineReducers } from 'redux';
import user from './user';
import flash from './flash';
import repos from './repos';

const rootReducer = combineReducers({
  user,
  flash,
  repos
});

export default rootReducer;
