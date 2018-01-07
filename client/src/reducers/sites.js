const flash = (state = [], action) => {
  switch (action.type) {
    case 'UPDATE_SITES':
      return [
        ...state,
        ...action.data,
      ];
    default:
      return state;
  }
};

export default flash;
