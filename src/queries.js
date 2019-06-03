import { gql } from "apollo-boost";

export const GET_USER = gql`
query ($login: String!){
  user(login: $login) {
    repositories(first: 100) {
      edges{
        node {
          name
          nameWithOwner
          createdAt
          isPrivate
          description
        }
      }
    }
  }
}`;

export const GET_REPO = gql`
query GET_REPO($owner: String!, $name: String!, $number: Int!) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      number
      state
      title
      participants {
        totalCount
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
            reactions(first: 100) {
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
}`;