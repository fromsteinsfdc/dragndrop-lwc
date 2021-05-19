import { LightningElement, track } from 'lwc';

export default class DragndropTest extends LightningElement {
    @track rows = [];

    connectedCallback() {
        for (let i=0; i<5; i++) {
            this.rows.push('This is row '+ (i+1));
        }
    }

    handleDropzoneDrop(event) {
        console.log('initial list = '+ JSON.stringify(this.rows))
        this.rows = event.detail.reorderedList;
        console.log('reorderedList = '+ JSON.stringify(this.rows));
    }
}