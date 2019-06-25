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

export const GET_COMMITCOMMENTS = gql`
query getCommitComments($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    commitComments(first:50){
      totalCount
      edges{
        node{
          url
          author{
            login
            avatarUrl
          }
          createdAt
          body
          reactions(first:100){
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
}`;

export const GET_REPO = gql`
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
`;