import React from 'react';
import { connect } from 'react-redux';
import SidebarContent from 'components/Sidebar/SidebarContent';
import SidebarNavMenu from 'components/Sidebar/SidebarNavMenu';
import { toggleSidebarVisibility, setSidebarTab } from './actions';
import { setUpMIDIDevices } from '../Midi/actions';
import { displaySystemMessage } from '../MessagesBox/actions';
import { MESSAGE_STATUS } from '../../constants';
import { isGoogleChrome } from './utils';

const propTypes = {
  isVisible: React.PropTypes.bool,
  activeTab: React.PropTypes.string,
  bottomArrowPosition: React.PropTypes.number,
  toggleSidebarVisibility: React.PropTypes.func,
  setSidebarTab: React.PropTypes.func,
  setUpMIDIDevices: React.PropTypes.func,
  displaySystemMessage: React.PropTypes.func,
};


class Sidebar extends React.Component {
  componentDidMount() {
    this.props.setUpMIDIDevices(); // Prepare midi stuff
    if (!isGoogleChrome()) {
      this.props.displaySystemMessage('Freesound Explorer works better on Chrome ;)', MESSAGE_STATUS.ERROR);
    }
  }

  render() {
    const sidebarClassName = `Sidebar${(this.props.isVisible) ? ' active' : ''}`;
    return (
      <aside>
        <div className={sidebarClassName}>
          <SidebarContent activeTab={this.props.activeTab} />
          <SidebarNavMenu
            activeTab={this.props.activeTab}
            setSidebarTab={this.props.setSidebarTab}
            toggleSidebarVisibility={this.props.toggleSidebarVisibility}
            isSidebarVisible={this.props.isVisible}
            bottomArrowPosition={this.props.bottomArrowPosition}
          />
        </div>
      </aside>
    );
  }
}

const mapStateToProps = state => state.sidebar;

Sidebar.propTypes = propTypes;
export default connect(mapStateToProps, {
  toggleSidebarVisibility,
  setSidebarTab,
  setUpMIDIDevices,
  displaySystemMessage,
})(Sidebar);
