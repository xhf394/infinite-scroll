import React, { Component } from 'react';

import './App.css';

const applyUpdateResult = (result) => (prevState) => ({
  hits: [...prevState.hits, ...result.hits],
  page: result.page,
  
  //add loading status
  isLoading: false,

  //track errors
  isError: false,
});

const applySetResult = (result) => (prevState) => ({
  hits: result.hits,
  page: result.page,
  
  //add loading status
  isLoading: false,

  //track errors
  isError: false,
});

//track error when it occurs
const applySetError = (prevState) => ({
  isError: true,
  isLoading: false,
})

const getHackerNewsUrl = (value, page) =>
  `https://hn.algolia.com/api/v1/search?query=${value}&page=${page}&hitsPerPage=100`;

class App extends React.Component {
  constructor(props) {
    super(props);
    
    //initiate value 
    this.state = {
      hits: [],
      page: null,
      
      //track loading info
      isLoading: false,

      //track error
      isError: false,
    };
  }
  
  /**
  * onInitialSearch() executes by first search
    it will trigger api to fetch data
    @params value or null
    @return {null} no side effects
    @return {value} pass initial page number and fetch data
  */ 
  onInitialSearch = (e) => {
    e.preventDefault();

    const { value } = this.input;
    
    //handle null value;
    if (value === '') {
      return;
    }
    
    //execute search process
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
      .then(result => this.onSetResult(result, page))
      //set error handler
      .catch(this.onSetError);
  }
  
  //error handler method
  onSetError = () => 
    this.setState(applySetError);

  onSetResult = (result, page) =>
    page === 0
      ? this.setState(applySetResult(result))
      : this.setState(applyUpdateResult(result));

  render() {
    return (
      <div className="page">
        <div className="interactions">
          <form type="submit" onSubmit={this.onInitialSearch}>
            <input 
              type="text" 
              //ref callback function
              ref={node => this.input = node} />
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

          //track errors
          isError={this.state.isError}
        />
      </div>
    );
  }
}

//pass all neccessary arguments to List component
//update List component to ES6 class component

class List extends React.Component {
  componentDidMount() {
    //add event listener to fetch list
    window.addEventListener('scroll', this.onScroll, false);
  }
    
  componentWillUnmount() {
    //remove event listener
    window.removeEventListener('scroll', this.onScroll, false);
  }

  onScroll = () => {
    if(
      //test when reach bottom
      (window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 500) &&
      
      //already get back search value
      this.props.list.length &&

      //only trigger once reach bottom, no pending request, the scroll event will trigger 
      !this.props.isLoading &&

      //inactive when there is an error
      !this.props.isError
    ) {

      //executes new pagniated search
      this.props.onPaginatedSearch();
    }
  }

  render() {
    //pass arguments 
    const {list, page, isLoading, isError, onPaginatedSearch} = this.props;
    
    return (
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
        
        <div className="interactions"
         //mannually handle error
        >
        {(page !== null && !isLoading && isError) &&
        <div>
          <div>
            Something went wrong...
          </div>
          <button
          //add a button to manually search again 
          type="button"
          onClick={onPaginatedSearch}
          >
          Try Again
          </button>
        </div>  
        }   
        </div> 

      </div>
    )
  }
}

export default App;
