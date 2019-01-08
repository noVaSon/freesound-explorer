import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { PERFORM_QUERY_AT_MOUNT } from 'constants';
import InputTextButton from 'components/Input/InputTextButton';
import SelectWithLabel from 'components/Input/SelectWithLabel';
import SliderRange from 'components/Input/SliderRange';
import { debounce } from 'lodash';
import { updateSorting, updateDescriptor, updateMinDuration, updateMaxDuration,
  updateMaxResults, updateQuery }
  from './actions';

// 00 central function for getting a resoponse from Freesound.org
import { getSounds, getResultsCount } from '../Sounds/actions';
import { setExampleQueryDone } from '../Sidebar/actions';
import { randomQuery } from '../../utils/randomUtils';

// 03 validate types
const propTypes = {
  maxResults: PropTypes.number,
  maxDuration: PropTypes.number,
  minDuration: PropTypes.number,
  currentQuery: PropTypes.string,
  sorting: PropTypes.string,
  query: PropTypes.string,
  descriptor: PropTypes.string,
  getSounds: PropTypes.func,
  getResultsCount: PropTypes.func,
  isExampleQueryDone: PropTypes.bool,
  updateSorting: PropTypes.func,
  updateDescriptor: PropTypes.func,
  updateMinDuration: PropTypes.func,
  updateMaxDuration: PropTypes.func,
  updateMaxResults: PropTypes.func,
  updateQuery: PropTypes.func,
  setExampleQueryDone: PropTypes.func,
};

class QueryBox extends React.Component {
  // TODO Add "new space" button to differentiate between rearrangement and new query
  constructor(props) {
    super(props);
    this.submitQuery = this.submitQuery.bind(this);
    this.tryQueryAtMount = this.tryQueryAtMount.bind(this);
  }

  componentWillMount() {
    // prevents too many requests to FS server
    this._debouncedResultsCount = debounce(this.props.getResultsCount.bind(this), 400, {
      leading: false,
      trailing: true,
    });
  }

  componentDidMount() {
    if (PERFORM_QUERY_AT_MOUNT) {
      // query at mount to have the user play with something with no additional interaction
      if (!this.props.isExampleQueryDone) {
        this.tryQueryAtMount();
      }
    }
  }

  tryQueryAtMount() {
    if (sessionStorage.getItem('appToken')) {
      this.submitQuery();
      this.props.setExampleQueryDone();
    } else {
      setTimeout(this.tryQueryAtMount, 500);
    }
  }

  submitQuery() {
    document.getElementsByClassName('active')[1].focus();
    // 05 copies props from state
    let { query } = this.props;
    const { sorting, descriptor, maxResults, minDuration, maxDuration } = this.props;
    const queryParams = { sorting, descriptor, maxResults, minDuration, maxDuration };
    if (!query.length) {
      query = randomQuery();
    }
    // 07 prepare imported function to use parameters in props (from state)
    this.props.getSounds(query, queryParams);
  }

  render() {
    return (
      <form
        id="query-form"
        className="QueryForm"

        // 04 send request with all parameters to FS
        onSubmit={(evt) => {
          evt.preventDefault();
          this.submitQuery();
        }}
      >
        <InputTextButton
        // TODO: allow text based interacive filtering
          onTextChange={(evt) => {
            const query = evt.target.value;
            // 02 updates state with entered query
            this.props.updateQuery(query);
            // makes a reqest to freesound for each keystroke to get number of possible results
            if (query != false) {
              this._debouncedResultsCount();
            }
          }}
          currentValue={this.props.query}
          tabIndex="0"
          placeholder={this.props.currentQuery || 'query terms, e.g.: instruments'}
          buttonIcon="fa fa-search fa-lg"
        />
        <SelectWithLabel
          onChange={(evt) => {
            const descriptor = evt.target.value;
            this.props.updateDescriptor(descriptor);
            // TODO: make view rearrangeable by descriptor
          }}
          options={[{ value: 'lowlevel.mfcc.mean', name: 'Timbre' },
            { value: 'tonal.hpcp.mean', name: 'Tonality' }]}
          label="Arrange by"
          tabIndex="0"
          defaultValue={this.props.descriptor}
        />
        <SelectWithLabel
        // TODO: clarify role of sort-by -> does not appy to rearrangement because of API usage
          onChange={(evt) => {
            const sorting = evt.target.value;
            this.props.updateSorting(sorting);
          }}
          options={[
            { value: 'score', name: 'Relevance' },
            { value: 'rating_desc', name: 'Rating' },
            { value: 'duration_desc', name: 'Duration' },
            { value: 'downloads_desc', name: 'Downloads' },
            { value: 'creation_desc', name: 'Creation Date (newest first)' },
            { value: 'creation_asc', name: 'Creation Date (oldest first)' },
          ]}
          label="Sort by"
          tabIndex="0"
          defaultValue={this.props.sorting}
        />
        <SliderRange
          label="Number of results"
          minValue="20"
          maxValue="450"
          onChange={(evt) => {
            const maxResults = evt.target.value;
            this.props.updateMaxResults(maxResults);
            // TODO: receive all sounds <30s and filter only display
          }}
          currentValue={this.props.maxResults}
          tabIndex="0"
          id="max-results-slider"
        />
        <SliderRange
          label="Maximum duration"
          minValue="0.5"
          maxValue="30"
          step="0.5"
          onChange={(evt) => {
            const maxDuration = evt.target.value;
            this.props.updateMaxDuration(maxDuration);
              this._debouncedResultsCount();
          }}
          currentValue={this.props.maxDuration}
          tabIndex="0"
          id="max-duration-slider"
        />
      </form>
    );
  }
}

const mapStateToProps = (state) => {
  const spaceNum = state.spaces.spaces.length;
  const { isExampleQueryDone } = state.sidebar;
  let currentQuery = '';
  let currentSpace = {};
  currentSpace.query = '';
  if (spaceNum) {
    currentSpace = state.spaces.spaces.find(space =>
      space.queryID === state.spaces.currentSpace);
    if (currentSpace) {
      currentQuery = currentSpace.query;
    }
  }
  // 05 the state.search object includes search.query
  return Object.assign({}, { isExampleQueryDone, currentQuery }, state.search);
};

/*
* 01 pass the imported functions and variables
* into the react component as props
*/
QueryBox.propTypes = propTypes;
export default connect(mapStateToProps, {
  getSounds,
  getResultsCount,
  setExampleQueryDone,
  updateDescriptor,
  updateSorting,
  updateMinDuration,
  updateMaxDuration,
  updateMaxResults,
  updateQuery,
})(QueryBox);
