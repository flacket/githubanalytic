import { gql } from "apollo-boost";

export const GET_REPOS = gql`
query {
  user(login: "shiffman") {
    repositories(first: 100) {
      edges{
        node {
          id
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

export const GET_USER = gql`
query {
  user(login:"Flacket") {
    name
  }
}`;

export const GET_REPO = gql`
query {
  repository(owner: "cdr", name: "code-server") {
    pullRequest(number: 146) {
      number
      state
      title
      participants{
        totalCount
      }
      comments(first: 100) {
        edges {
          node {
            body
            createdAt
            author{
              login
              avatarUrl
            }
            reactions(first: 100){
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
}`;