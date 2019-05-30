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
}
`;

export const GET_USER = gql`
query {
    user(login:"Flacket") {
      name
  }
  }
`;