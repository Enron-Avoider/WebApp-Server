import { gql } from "apollo-boost";

export const GET_CALCULATIONS = gql`
  {
    calculations @client {
        onTable
        title
        about
        scope {
            a
            b
            c
            d
            e
            f
            g
            h
        }
        calc
    }
  }
`;

export const ADD_CALCULATION = gql`
  mutation addCalculation($title: String!, $about: String!, $onTable: String!, $calc: String!, $scope: JSON!) {
    addCalculation(title: $title, about: $about, onTable: $onTable, calc: $calc, scope: $scope) @client {
      title
      about
      onTable
      calc
      scope {
        a
        b
        c
        d
        e
        f
        g
        h
      }
    }
  }
`;

export const REMOVE_CALCULATION = gql`
  mutation removeCalculation($title: String!) {
    removeCalculation(title: $title) @client {
      title
    }
  }
`;

export const SAVE_CALCULATION = gql`
  mutation saveCalculation($title: String!, $about: String!, $newTitle: String!, $onTable: String!, $calc: String!, $scope: JSON!) {
    saveCalculation(title: $title, about: $about, newTitle: $newTitle, onTable: $onTable, calc: $calc, scope: $scope) @client {
      title
      about
      onTable
      calc
      scope {
        a
        b
        c
        d
        e
        f
        g
        h
      }
    }
  }
`;
