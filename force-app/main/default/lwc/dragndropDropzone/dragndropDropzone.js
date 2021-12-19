import { LightningElement, wire, api } from 'lwc';

// Import message service features required for publishing and the message channel
import {
    publish,
    subscribe,
    unsubscribe,
    APPLICATION_SCOPE,
    MessageContext
} from 'lightning/messageService';
import DRAGNDROP_MC from '@salesforce/messageChannel/DragndropMessageChannel__c';

const DEFAULT_COLOUR = '#005fb2';
const DEFAULT_HEIGHT = '0.75em';

export default class DragndropDropzone extends LightningElement {

    @api name;  // Reserved for future use (to differentiate between multiple dragndrop components)
    // Required properties
    @api index;
    @api list;
    
    // Optional properties
    @api height;
    @api colour;
    @api disabled;

    isActive;

    get styleString() {
        let str = 'background-color:' + this.colour + ';min-height:' + (this.isActive ? this.height : 0) + ';transition:min-height 0.25s';
        return str;
    }

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        this.setDefaults();
        this.subscribeToMessageChannel();
    }

    // Encapsulate logic for Lightning message service subscribe and unsubsubscribe
    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                DRAGNDROP_MC,
                (message) => this.handleMessage(message),
                { scope: APPLICATION_SCOPE }
            );
        }
    }

    // Handler for message received by dragndropRow components
    handleMessage(message) {
        if (message.eventType == 'dragover') {
            this.isActive = message.activeDropzoneIndex == this.index;
        }

        if (message.eventType == 'dragleave') {
            this.isActive = false;
        }

        if (message.eventType == 'drop') {
            if (message.activeDropzoneIndex == this.index) {
                this.dispatchNewList(this.list, message.draggedIndex, this.index);
            }
        }
    }

    setDefaults() {
        this.colour = this.colour || DEFAULT_COLOUR;
        this.height = this.height || DEFAULT_HEIGHT;
    }

    handleDragover(event) {
        event.preventDefault();
        this.isActive = true;
    }

    handleDragleave(event) {
        this.isActive = false;
    }

    handleDropzoneDrop(event) {
        event.preventDefault();
        let draggedIndex = event.dataTransfer.getData('drag-index');
        this.dispatchNewList(this.list, draggedIndex, this.index);
    }

    dispatchNewList(list, draggedIndex, dropzoneIndex) {
        this.isActive = false;

        // Check to see if it's not actually moving because it was dropped into the dropzone directly above or below it (which is like asking yourself for cutsies, it's like... sure).
        if (draggedIndex == dropzoneIndex || draggedIndex == (dropzoneIndex - 1)) {
            return null;
        }
        const dropEvent = new CustomEvent('dropzonedrop', {
            detail: {
                reorderedList: this.reorderList(list, draggedIndex, dropzoneIndex),
                draggedIndex: draggedIndex,
                dropzoneIndex: dropzoneIndex
            }
        });

        // Dispatches the event.
        this.dispatchEvent(dropEvent);
    }

    reorderList(list, draggedIndex, dropzoneIndex) {
        // It's not actually moving, it was dropped into the dropzone directly above or below it
        if (draggedIndex == dropzoneIndex || draggedIndex == (dropzoneIndex - 1)) {
            return list;
        } else {
            let indices = [...Array(list.length).keys()];
            let draggedItem = indices.splice(draggedIndex, 1);
            let startPos = dropzoneIndex;
            if (draggedIndex < dropzoneIndex) {
                startPos--;
            }
            if (draggedItem.length) {
                indices.splice(startPos, 0, draggedItem[0]);
            }
            let newList = [];
            for (let i of indices) {
                newList.push(list[i]);
            }
            return newList;
        }
    }
}