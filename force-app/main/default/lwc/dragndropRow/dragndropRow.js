import { LightningElement, api, wire } from 'lwc';

// Import message service features required for publishing and the message channel
import { publish, MessageContext } from 'lightning/messageService';
import DRAGNDROP_MC from '@salesforce/messageChannel/DragndropMessageChannel__c';

const DEFAULT_ICON = 'utility:drag_and_drop';

export default class DragndropRow extends LightningElement {
    @api index;
    @api handleClass;
    @api iconName;

    @wire(MessageContext)
    messageContext;


    get activeDropzoneIndex() {
        return this._activeDropzoneIndex;
    }
    set activeDropzoneIndex(index) {
        //console.log('setting activedropzoneindex to ' + index + ' from ' + this.activeDropzoneIndex);
        this._activeDropzoneIndex = index;
    }
    _activeDropzoneIndex;

    connectedCallback() {
        this.setDefaults();
    }

    setDefaults() {
        this.iconName = this.iconName || DEFAULT_ICON;
    }

    handleDragStart(event) {
        event.dataTransfer.setData('drag-index', this.index);
        // const payload = { 
        //     eventType: 'draghandleDragstart',
        //     draghandleIndex: this.index
        // };
        // publish(this.messageContext, DRAGNDROP_MC, payload);
    }

    handleRowDragover(event) {
        event.preventDefault();
        let newActiveDropzoneIndex = this.index;
        let rect = event.currentTarget.getBoundingClientRect();
        let mouseY = event.clientY - rect.top;
        let isTopHalf = (mouseY / rect.height < 0.5);

        if (!isTopHalf) {
            newActiveDropzoneIndex++;
        }
        this.activeDropzoneIndex = newActiveDropzoneIndex;

        const payload = {
            eventType: 'dragover',
            activeDropzoneIndex: this.activeDropzoneIndex
        };
        publish(this.messageContext, DRAGNDROP_MC, payload);


    }

    handleRowDragleave(event) {
        //console.log('in handle row Dragleave');
        const payload = {
            eventType: 'dragleave'
        };
        publish(this.messageContext, DRAGNDROP_MC, payload);
    }

    handleRowDrop(event) {
        event.preventDefault();
        let dragIndex = event.dataTransfer.getData('drag-index');
        const payload = {
            eventType: 'drop',
            activeDropzoneIndex: this.activeDropzoneIndex,
            draggedIndex: dragIndex
        };
        publish(this.messageContext, DRAGNDROP_MC, payload);
    }
}