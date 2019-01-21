import React, { Component } from 'react';

import './App.css';

const applyUpdateResult = (result) => (prevState) => ({
  hits: [...prevState.hits, ...result.hits],
  page: result.page,
  //add loading status
  isLoading: false,
});

const applySetResult = (result) => (prevState) => ({
  hits: result.hits,
  page: result.page,
  //add loading status
  isLoading: false,
});

const getHackerNewsUrl = (value, page) =>
  `https://hn.algolia.com/api/v1/search?query=${value}&page=${page}&hitsPerPage=100`;

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hits: [],
      page: null,
      //track loading info
      isLoading: false,
    };
  }

  onInitialSearch = (e) => {
    e.preventDefault();

    const { value } = this.input;

    if (value === '') {
      return;
    }

    this.fetchStories(value, 0);
  }
  
  //retrieve the next pages of pagniated data
  //by clicking this method, page data will be added 1 per time
  onPaginatedSearch = (e) =>
    this.fetchStories(this.input.value, this.state.page + 1);

  fetchStories = (value, page) => {
    //when request is made, loading property is set to true;
    this.setState({isLoading: true});
    //when request is finished asynchronously, set back to false;
    fetch(getHackerNewsUrl(value, page))
      .then(response => response.json())
      .then(result => this.onSetResult(result, page));
  }

  onSetResult = (result, page) =>
    page === 0
      ? this.setState(applySetResult(result))
      : this.setState(applyUpdateResult(result));

  render() {
    return (
      <div className="page">
        <div className="interactions">
          <form type="submit" onSubmit={this.onInitialSearch}>
            <input type="text" ref={node => this.input = node} />
            <button type="submit">Search</button>
          </form>
        </div>
        
        <List
          list={this.state.hits}
          //add page state
          page={this.state.page}
          //add onPaginated Search method to retrieve the next pages of paginated data
          onPaginatedSearch={this.onPaginatedSearch}
          //loading status
          isLoading={this.state.isLoading}
        />
      </div>
    );
  }
}

//pass all neccessary arguments to List component
const List = ({ list, page, isLoading, onPaginatedSearch }) =>
  <div>
    <div className="list">
      {list.map(item => <div className="list-row" key={item.objectID}>
        <a href={item.url}>{item.title}</a>
      </div>)}
    </div>

    <div className="interactions"
    //add loading status
    >
      {isLoading && <span>Loading...</span>}
    </div>
    <div className="interactions">
      {
        page !== null &&
        <button
          type="button"
          onClick={onPaginatedSearch}
        >
        More
        </button>
      }
    </div>

  </div>

export default App;
