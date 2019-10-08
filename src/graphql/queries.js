import { gql } from "apollo-boost";

export const GET_USER = gql`
query ($login: String!){
  user(login: $login) {
    repositories(first: 100) {
      nodes {
        id
        name
        nameWithOwner
        createdAt
        isPrivate
        description
      }
    }
  }
}`;

export const GET_COMMITCOMMENTS = gql`
query getCommitComments($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    commitComments(first:50){
      totalCount
        node{
          url
          author{
            login
            avatarUrl
          }
          createdAt
          body
          reactions(first:100){
            node{
              user{
                login
              }
            }
          }          
        }
    }
  }
}`;

export const GET_REPO = gql`
query getRepo($owner: String!, $name: String!, $number: Int!) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      author{
        login
        avatarUrl
      }
      body
      bodyHTML
      createdAt
      closedAt
      number
      state
      title
      url
      reactions(first: 100){
        totalCount
        nodes{
          user{
            login
          }
        }
      }
      participants(first: 100) {
        totalCount
        nodes{
          login
        }
      }
      reviewThreads(first: 50) {
        nodes {
          comments(first: 20) {
            totalCount
            nodes {
              body
              bodyHTML
              author {
                login
                avatarUrl
              }
              createdAt
              reactions(first:15) {
                totalCount
                nodes{
                  user{
                    login
                  }
                }
              }
            }
          }
        }
      }
      comments(first: 100) {
        nodes {
          body
          bodyHTML
          createdAt
          author {
            login
            avatarUrl
          }
          reactions(first: 50) {
            totalCount
            nodes {
              user {
                login
              }
            }
          }
        }
      }
    }
  }
}`;

export const GET_REPOS = gql`
query getRepos($owner: String!, $name: String!, $cursor: String) {
  repository(owner: $owner, name: $name) {
    pullRequests(
      first: 50
      after: $cursor
      orderBy: { field: CREATED_AT, direction: DESC }
    ){
      nodes {
        author{
          login
          avatarUrl
        }
        body
        bodyHTML
        createdAt
        closedAt
        number
        state
        title
        url
        reactions(first: 100){
          totalCount
          nodes{
            user{
              login
            }
          }
        }
        participants(first: 100) {
          totalCount
          nodes{
            login
          }
        }
        reviewThreads(first: 100) {
          nodes {
            comments(first: 20) {
              totalCount
              nodes {
                body
                bodyHTML
                author {
                  login
                  avatarUrl
                }
                createdAt
                reactions(first:15) {
                  totalCount
                  nodes{
                    user{
                      login
                    }
                  }
                }
              }
            }
          }
        }
        comments(first: 100) {
          nodes {
            body
            bodyHTML
            createdAt
            author {
              login
              avatarUrl
            }
            reactions(first: 50) {
              totalCount
              nodes {
                user {
                  login
                }
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}`;

export const GET_COUNT_PR = gql`
query getCountPR($owner: String!, $name: String!, $endCursor: String) {
  repository(owner: $owner, name: $name) {
    pullRequests(
      first: 100
      after: $endCursor
      orderBy: { field: CREATED_AT, direction: DESC }
    ){
      nodes {
        reactions(first: 1){
          totalCount
        }
        participants(first: 1) {
          totalCount
        }
        reviewThreads(first: 1) {
          totalCount
          nodes {
            comments(first: 1) {
              totalCount
              nodes{
                reactions(first:1) {
                  totalCount
                }
              }
            }
          }
        }
        comments(first: 1) {
          totalCount
          nodes {
            reactions(first: 1) {
              totalCount
            }
          }
        }
    }
      pageInfo {
        startCursor
        hasNextPage
        endCursor
      }
    }
  }
}`;

export const USER = gql`
query userstats($owner: String!) {
  user(login: $owner) {
    login
    url
    avatarUrl
    followers(first: 1){
      totalCount
    }
    following(first: 1){
      totalCount
    }
  }
}`;

export const USER_STATS = gql`
query userstats($owner: String!) {
  repositoryOwner(login: $owner) {
    repositories(first: 100) {
      totalCount
      nodes {
        watchers(first: 1) {
          totalCount
        }
        forkCount
        stargazers(first: 1) {
          totalCount
        }
      }
    }
  }
}`;