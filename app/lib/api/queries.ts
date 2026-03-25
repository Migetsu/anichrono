// GraphQL Queries for Shikimori API

export const ANIME_DETAILS_QUERY = `
  query ($ids: String, $limit: Int) {
    animes(ids: $ids, limit: $limit) {
      id 
      name 
      russian 
      kind 
      score
      poster { 
        mainUrl 
        originalUrl 
      }
      airedOn { 
        year 
      }
      genres { 
        id 
        name 
        russian 
      }
    }
  }
`

export const ANIME_SEARCH_QUERY = `
  query($search: String, $limit: Int, $kind: String) {
    animes(search: $search, limit: $limit, kind: $kind) {
      id 
      name 
      russian 
      kind 
      score
      poster { 
        mainUrl 
        originalUrl 
      }
      airedOn { 
        year 
      }
    }
  }
`
export const ANIME_DETAILS_FULL_QUERY = `
  query ($id: String) {
    animes(ids: $id, limit: 1) {
      id 
      name 
      russian 
      kind 
      score
      status
      episodes
      episodesAired
      duration
      description
      descriptionHtml
      rating
      season
      nextEpisodeAt
      poster { 
        mainUrl 
        originalUrl 
      }
      airedOn { 
        year 
        month
        day
        date
      }
      genres { 
        id 
        name 
        russian 
      }
      studios {
        id
        name
      }
      videos {
        id
        name
        url
        playerUrl
      }
    }
  }
`

export const ANIME_RELATED_QUERY = `
  query ($id: String) {
    animes(ids: $id, limit: 1) {
      related {
        id
        anime {
          id
          name
          russian
          kind
          status
          airedOn {
            year
          }
          season
          rating
          score
          poster {
            mainUrl
          }
        }
      }
    }
  }
`

export const ANIME_CHARACTERS_QUERY = `
  query ($id: String) {
    animes(ids: $id, limit: 1) {
      characterRoles {
        character {
          id
          name
          russian
          poster {
            originalUrl
          }
        }
      }
    }
  }
`
