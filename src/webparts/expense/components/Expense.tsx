import * as React from 'react';

import type { IExpenseProps } from './IExpenseProps';
import Expense2 from './Expense2';


export default class Expense extends React.Component<IExpenseProps> {
  public render(): React.ReactElement<IExpenseProps> {
    const {
     
    } = this.props;

    return (
     <>
     <Expense2/>

     </>
    );
  }
}
