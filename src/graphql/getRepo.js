import { gql } from "apollo-boost"

export default gql`
query repository($number: Int!) {
  repository(owner: "cdr", name: "code-server") {
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
}`