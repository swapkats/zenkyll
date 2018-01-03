import { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { validateToken } from '../actions/auth';

class FetchUser extends Component {
  state = { loaded: false };

  componentDidMount() {
    const { dispatch, history } = this.props;
    dispatch(validateToken(this.loaded, history));
  }

  componentWillReceiveProps() {
    if (!this.state.loaded) this.loaded();
  }

  loaded = () => {
    this.setState({ loaded: true });
  }

  render() {
    return this.state.loaded ? this.props.children : null;
  }
}

const mapStateToProps = state => ({});

export default connect(mapStateToProps)(withRouter(FetchUser));
