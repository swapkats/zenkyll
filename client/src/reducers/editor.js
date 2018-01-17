const editor = (state = {}, action) => {
  switch (action.type) {
    case 'CURSOR_CHANGE':
      return {
        ...state,
        cursor: action.cursor
      };
    default:
      return state;
  }
};

export default editor;
