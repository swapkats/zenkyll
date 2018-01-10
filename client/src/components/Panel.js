import React from 'react';
import PropTypes from 'prop-types';

class Panel extends React.Component {
  static propTypes = {
    onChange: PropTypes.func,
    value: PropTypes.string,
    overflowY: PropTypes.bool
  };

  render () {
    return (
      <div>
        {this.props.children}
      </div>
    )
  }
}

export default Panel
