import { ALGOLIA_ID, ALGOLIA_API_KEY } from '@env';
import alogliasearch from 'algoliasearch';
import { InstantSearch } from 'react-instantsearch-hooks';

import SearchBox from '../../components/SearchBox';
import SearchResults from '../../components/SearchResults';

const algoliaClient = alogliasearch(ALGOLIA_ID, ALGOLIA_API_KEY);

const searchClient = {
    ...algoliaClient,
    search(requests) {
      if (requests.every(({ params }) => !params.query)) {
        return Promise.resolve({
          results: requests.map(() => ({
            hits: [],
            nbHits: 0,
            nbPages: 0,
            page: 0,
            processingTimeMS: 0,
            hitsPerPage: 0,
            exhaustiveNbHits: false,
            query: '',
            params: '',
          })),
        });
      }
  
      return algoliaClient.search(requests);
    },
  };

const Users = () => {
    return(
        <>
            <InstantSearch searchClient={searchClient} indexName='user-accounts'>
                <SearchBox />
                <SearchResults />
            </InstantSearch>
        </>
    );
};

export default Users;