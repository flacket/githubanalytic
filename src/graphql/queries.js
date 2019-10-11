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
query getRepos(
  $owner: String!, 
  $name: String!, 
  $endCursor: String, 
  $rvThreads: Int, 
  $comments: Int,
  $rvThreadsComments: Int,
  $commentsReactions: Int,
) {
  repository(owner: $owner, name: $name) {
    pullRequests(
      first: 50
      after: $endCursor
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
        reviewThreads(first: $rvThreads) {
          nodes {
            comments(first: $rvThreadsComments) {
              totalCount
              nodes {
                body
                bodyHTML
                author {
                  login
                  avatarUrl
                }
                createdAt
                reactions(first:20) {
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
        comments(first: $comments) {
          nodes {
            body
            bodyHTML
            createdAt
            author {
              login
              avatarUrl
            }
            reactions(first: $commentsReactions) {
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
  rateLimit {
    limit
    cost
    remaining
    resetAt
  }
}`;

export const GET_COUNT_PR = gql`
query getCountPR(
  $owner: String!, 
  $name: String!, 
  $endCursor: String, 
  $rvThreads: Int, 
  $comments: Int,
  $rvThreadsComments: Int,
  $commentsReactions: Int,
  ) {
  repository(owner: $owner, name: $name) {
    pullRequests(
      first: 100
      after: $endCursor
    ){
      nodes {
        reactions(first: 1){
          totalCount
        }
        participants(first: 1) {
          totalCount
        }
        reviewThreads(first: $rvThreads) {
          totalCount
          nodes {
            comments(first: $rvThreadsComments) {
              totalCount
              nodes{
                reactions(first:1) {
                  totalCount
                }
              }
            }
          }
        }
        comments(first: $comments) {
          totalCount
          nodes {
            reactions(first: $commentsReactions) {
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
/*{"owner": "cdr", 
"name": "code-server", 
"endCursor": null, 
"rvThreads": 1, 
"comments": 1,
"rvThreadsComments": 1,
"commentsReactions": 1 }*/

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