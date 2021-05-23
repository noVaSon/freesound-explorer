import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { messagesBoxHeight } from 'stylesheets/variables.json';
import MessagesBox from 'components/MessagesBox';
import { DEFAULT_MESSAGE_DURATION } from 'constants';
import { moveSidebarArrow } from '../Sidebar/actions';

// TODO: store className in reducer
const DEFAULT_CLASSNAME = 'message-box';

const propTypes = {
  message: PropTypes.string,
  status: PropTypes.string,
  messageCount: PropTypes.number,
  moveSidebarArrow: PropTypes.func,
};

class MessagesBoxContainer extends Component {
  constructor(props) {
    super(props);
    this.visibilityTimeout = undefined;
    this.className = DEFAULT_CLASSNAME;
  }

  shouldComponentUpdate(nextProps) {
    // update component only when receiving a new message
    if (this.props.messageCount !== nextProps.messageCount) {
      clearTimeout(this.visibilityTimeout);
      this.handleTimedVisibility();
      return true;
    }
    return false;
  }

  handleTimedVisibility() {
    // move close-sidebar icon to avoid covering it with the message
    this.props.moveSidebarArrow(messagesBoxHeight);
    this.className = `${DEFAULT_CLASSNAME} active`;
    this.visibilityTimeout = setTimeout(() => {
      this.hideMessage();
    }, DEFAULT_MESSAGE_DURATION);
  }

  hideMessage() {
    // reset close-sidebar icon position
    this.props.moveSidebarArrow(0);
    this.className = DEFAULT_CLASSNAME;
    // FIXME store className in reducer instead of manually calling forceUpdate
    this.forceUpdate();
  }

  render() {
    return (
      <MessagesBox
        message={this.props.message}
        status={this.props.status}
        className={this.className}
      />
    );
  }
}


const mapStateToProps = state => state.messagesBox;

MessagesBoxContainer.propTypes = propTypes;
export default connect(mapStateToProps, { moveSidebarArrow })(MessagesBoxContainer);
