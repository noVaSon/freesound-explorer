import React from 'react';
import { connect } from 'react-redux';
import { getCurrentSpaceObj } from '../Spaces/utils';
import SoundListItem from '../../components/Sounds/SoundListItem';
import { selectSound, deselectSound, toggleHoveringSound } from '../../containers/Sounds/actions';
import { playAudio, stopAudio } from '../Audio/actions';

const propTypes = {
  space: React.PropTypes.object,
  sounds: React.PropTypes.object,
  selectSound: React.PropTypes.func,
  deselectSound: React.PropTypes.func,
  playAudio: React.PropTypes.func,
  stopAudio: React.PropTypes.func,
  toggleHoveringSound: React.PropTypes.func,
};

/* 
* The Sound List is a comlementary feature to the MapCircle view.
* Here sorting shall be possible to navigate on more abstract criteria, eg. duration.
* Highlight on hovering and selection shall be synchronous ot the map.
*/

const SoundListContainer = props =>
  (
    <div>
      {typeof props.space === 'undefined' ?
        <div className="empty-soundlist">No sounds to list, please search first!</div> :
        <div className="sound-list-container">
          <SoundListItem
            key={props.space.queryID}
            space={props.space}
            sounds={props.sounds}
            selectSound={props.selectSound}
            deselectSound={props.deselectSound}
            playAudio={props.playAudio}
            stopAudio={props.stopAudio}
            toggleHoveringSound={props.toggleHoveringSound}
          />
        </div>}
    </div>
  );

SoundListContainer.propTypes = propTypes;

function mapStateToProps(state) {
  return {
    space: getCurrentSpaceObj(state.spaces.spaces, state.spaces.currentSpace),
    sounds: state.sounds,
  };
}

export default connect(mapStateToProps, {
  selectSound,
  deselectSound,
  playAudio,
  stopAudio,
  toggleHoveringSound,
})(SoundListContainer);
