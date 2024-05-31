import { gql } from "apollo-boost";

export const GET_USER = gql`
  query($login: String!) {
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
  }
`;

export const GET_COMMITCOMMENTS = gql`
  query getCommitComments($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      commitComments(first: 50) {
        totalCount
        node {
          url
          author {
            login
            avatarUrl
          }
          createdAt
          body
          reactions(first: 100) {
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
`;

export const GET_REPO = gql`
  query getRepo($owner: String!, $name: String!, $number: Int!) {
    repository(owner: $owner, name: $name) {
      pullRequest(number: $number) {
        id
        number
        title
        author {
          login
          avatarUrl
        }
        additions
        deletions
        createdAt
        closedAt
        state
        url
        body
        bodyHTML
        reactions(first: 100) {
          totalCount
          nodes {
            user {
              id
              login
            }
          }
        }
        participants(first: 100) {
          totalCount
          nodes {
            id
            login
            ################################
            location
            following(first: 100) {
              totalCount
              nodes {
                id
              }
            }
            starredRepositories(first: 100) {
              totalCount
              nodes {
                id
              }
            }
            ################################
          }
        }
        comments(first: 100) {
          totalCount
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
                  id
                  login
                }
              }
            }
          }
        }
        reviewThreads(first: 50) {
          totalCount
          nodes {
            comments(first: 20) {
              totalCount
              nodes {
                body
                bodyHTML
                createdAt
                author {
                  login
                  avatarUrl
                }
                reactions(first: 15) {
                  totalCount
                  nodes {
                    user {
                      id
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

export const GET_REPOS = gql`
  query getRepos(
    $owner: String!
    $name: String!
    $beforeCursor: String
    $afterCursor: String
    $reactions: Int
    $participants: Int
    $comments: Int
    $commentsReactions: Int
    $rvThreads: Int
    $rvThreadsComments: Int
  ) {
    repository(owner: $owner, name: $name) {
      pullRequests(first: 10, before: $beforeCursor, after: $afterCursor) {
        totalCount
        nodes {
          id
          number
          title
          author {
            login
          }
          additions
          deletions
          createdAt
          closedAt
          state
          url
          body
          bodyHTML
          reactions(first: $reactions) {
            totalCount
            nodes {
              content
              user {
                id
                login
              }
            }
          }
          participants(first: $participants) {
            totalCount
            nodes {
              id
              login
            }
          }
          comments(first: $comments, orderBy: {field: UPDATED_AT, direction: ASC}) {
            totalCount
            nodes {
              body
              bodyHTML
              createdAt
              author {
                login
              }
              reactions(first: $commentsReactions) {
                totalCount
                nodes {
                  content
                  user {
                    id
                    login
                  }
                }
              }
            }
          }
          reviewThreads(first: $rvThreads) {
            totalCount
            nodes {
              comments(first: $rvThreadsComments) {
                totalCount
                nodes {
                  body
                  bodyHTML
                  createdAt
                  author {
                    login
                  }
                  reactions(first: 20) {
                    totalCount
                    nodes {
                      content
                      user {
                        id
                        login
                      }
                    }
                  }
                }
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
  }
`;

export const DOWN_REPOS = gql`
  query downRepos(
    $owner: String!
    $name: String!
    $beforeCursor: String
    $afterCursor: String
    $reactions: Int
    $participants: Int
    $comments: Int
    $commentsReactions: Int
    $rvThreads: Int
    $rvThreadsComments: Int
  ) {
    repository(owner: $owner, name: $name) {
      pullRequests(first: 15, before: $beforeCursor, after: $afterCursor) {
        totalCount
        nodes {
          id
          number
          title
          author {
            login
          }
          additions
          deletions
          createdAt
          closedAt
          state
          url
          body
          bodyHTML
          reactions(first: $reactions) {
            totalCount
            nodes {
              content
              user {
                id
                login
              }
            }
          }
          participants(first: $participants) {
            totalCount
            nodes {
              id
              login
            }
          }
          comments(first: $comments, orderBy: {field: UPDATED_AT, direction: ASC}) {
            totalCount
            nodes {
              body
              bodyHTML
              createdAt
              author {
                login
              }
              reactions(first: $commentsReactions) {
                totalCount
                nodes {
                  content
                  user {
                    id
                    login
                  }
                }
              }
            }
          }
          reviewThreads(first: $rvThreads) {
            totalCount
            nodes {
              comments(first: $rvThreadsComments) {
                totalCount
                nodes {
                  body
                  bodyHTML
                  createdAt
                  author {
                    login
                  }
                  reactions(first: 20) {
                    totalCount
                    nodes {
                      content
                      user {
                        id
                        login
                      }
                    }
                  }
                }
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
  }
`;

/*{"owner": "twitter",
"name": "serial",
"afterCursor": null,
"comments": 1,
"commentsReactions": 1,
"rvThreads": 1,
"rvThreadsComments": 1
}*/

export const USER = gql`
  query userstats($owner: String!) {
    user(login: $owner) {
      login
      url
      avatarUrl
      followers(first: 1) {
        totalCount
      }
      following(first: 1) {
        totalCount
      }
    }
  }
`;

export const USER_STATS = gql`
  query userstats($owner: String!) {
    user(login: $owner) {
      login
      id
      followers {
        totalCount
      }
      following {
        totalCount
      }
      repositories(orderBy: {field: STARGAZERS, direction: DESC}, first: 50) {
        nodes {
          forkCount
          stargazerCount
          watchers {
            totalCount
          }
        }
      }
    }
  }
`;

export const REPOSITORY_PRS = gql`
  query getPRcant($name: String!, $owner: String!) {
    repository(name: $name, owner: $owner) {
      pullRequests(first: 1) {
        totalCount
      }
    }
  }
`;

export const ORG_MEMBERS = gql`
query getOrgMembers($owner: String!){
  organization(login: $owner) {
    membersWithRole(first: 100) {
      nodes {
        isSiteAdmin
        isEmployee
        login
        id
      }
    }
  }
}
`;

export const RATE_LIMIT = gql`
  query rateLimit {
    rateLimit {
      limit
      remaining
      resetAt
    }
  }
`;

export const GET_QUERY_PR = gql`
query getQueryMax($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    id
    name
    owner {
      login
    }
    pullRequests(first: 10) {
      totalCount
      nodes {
        labels(first: 10) {
          totalCount
          nodes {
            description
            name
            id
          }
          pageInfo {
            startCursor
            hasNextPage
            endCursor
          }
        }
        publishedAt
        mergedAt
        createdAt
        closedAt
        merged
        closed
        mergeable
        id
        number
        title
        author {
          login
        }
        commits {
          totalCount
        }
        additions
        deletions
        state
        bodyHTML
        reactions(first: 10) {
          totalCount
          nodes {
            content
            createdAt
            id
          }
          pageInfo {
            startCursor
            hasNextPage
            endCursor
          }
        }
        comments(first: 10) {
          totalCount
          nodes {
            id
            bodyHTML
            createdAt
            publishedAt
            author {
              login
            }
            editor {
              login
            }
            reactions(first: 10) {
              totalCount
              nodes {
                id
                content
                createdAt
              }
              pageInfo {
                startCursor
                hasNextPage
                endCursor
              }
            }
          }
          pageInfo {
            startCursor
            hasNextPage
            endCursor
          }
        }
        reviews(first: 10) {
          totalCount
          pageInfo {
            startCursor
            hasNextPage
            endCursor
          }
          nodes {
            id
            publishedAt
            bodyHTML
            reactions(first: 10) {
              totalCount
              pageInfo {
                startCursor
                hasNextPage
                endCursor
              }
              nodes {
                id
                content
                createdAt
              }
            }
            comments(first: 10) {
              totalCount
              pageInfo {
                startCursor
                hasNextPage
                endCursor
              }
              nodes {
                bodyHTML
                createdAt
                publishedAt
                id
                author {
                  login
                }
                editor {
                  login
                }
                reactions(first: 10) {
                  totalCount
                  nodes {
                    id
                    content
                    createdAt
                  }
                  pageInfo {
                    startCursor
                    hasNextPage
                    endCursor
                  }
                }
              }
            }
          }
        }
        reviewThreads(first: 10) {
          totalCount
          nodes {
            isResolved
            id
            comments(first: 10) {
              totalCount
              pageInfo {
                startCursor
                hasNextPage
                endCursor
              }
              nodes {
                id
                bodyHTML
                createdAt
                publishedAt
                author {
                  login
                }
                editor {
                  login
                }
                reactions(first: 10) {
                  totalCount
                  nodes {
                    id
                    content
                    createdAt
                  }
                  pageInfo {
                    startCursor
                    hasNextPage
                    endCursor
                  }
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
      pageInfo {
        startCursor
        hasNextPage
        endCursor
      }
    }
  }
}
`;
/*export const GET_QUERY_PR = gql`
query getQueryPR($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    nameWithOwner
    pullRequests(first: 5, orderBy: {field: COMMENTS, direction: DESC}) {
      totalCount
      nodes {
        number
        reactions(first: 1) {
          totalCount
        }
        participants(first: 1) {
          totalCount
        }
        comments(first: 3) {
          totalCount
        }
      }
    }
  }
}
`;*/