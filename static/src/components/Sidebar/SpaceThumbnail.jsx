import React from 'react';
import SpaceTitle from '../Map/SpaceTitle';
import Space from '../Map/Space';

const propTypes = {
  isSelected: React.PropTypes.bool,
  onClick: React.PropTypes.bool,
};

function SpaceThumbnail(props) {
  return (
    <div className={`space-thumbnail${(props.isSelected) ? ' active' : ''}`}>
      <SpaceTitle {...props} isThumbnail />
      <svg><Space {...props} isThumbnail /></svg>
    </div>
  );
}

SpaceThumbnail.propTypes = propTypes;
export default SpaceThumbnail;
