import { gql } from "apollo-boost"

export default gql`
query getrepos($owner: String!, $name: String!, $number: Int!) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      author{
        login
        avatarUrl
      }
      body
      createdAt
      number
      state
      title
      url
      reactions(first: 100){
        totalCount
        edges{
          node{
            user{
              login
            }
          }
        }
      }
      participants {
        totalCount
      }
      reviewThreads(first: 50) {
        edges {
          node {
            comments(first: 50) {
              edges {
                node {
                  body
                  author {
                    login
                    avatarUrl
                  }
                  createdAt
                  reactions(first:50) {
                    totalCount
                    edges{
                      node{
                        user{
                          login
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      comments(first: 100) {
        edges {
          node {
            body
            createdAt
            author {
              login
              avatarUrl
            }
            reactions(first: 80) {
              totalCount
              edges {
                node {
                  user {
                    login
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
`