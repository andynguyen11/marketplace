import React from 'react';
import AlloyEditor from 'alloyeditor';

const AlloyEditorComponent = React.createClass({
    componentDidMount() {
        this._editor = AlloyEditor.editable(this.props.container);
    },

    componentWillUnmount() {
        this._editor.destroy();
    },

    shouldComponentUpdate(nextProps, nextState) {
      return nextProps.html !== this.getDOMNode().innerHTML;
    },

    emitChange() {
        var html = this.getDOMNode().innerHTML;
        if (this.props.onChange && html !== this.lastHtml) {
            this.props.onChange(html);
        }
        this.lastHtml = html;
    },

    render() {
        return (
            <div
              id={this.props.container}
              onInput={this.emitChange}
              onBlur={this.emitChange}
              contentEditable
              dangerouslySetInnerHTML={{__html: this.props.html}}>
            </div>
        );
    }
});

export default AlloyEditorComponent;