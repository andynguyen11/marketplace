import React from 'react'
import ReactCSSTransitionGroup from 'react/lib/ReactCSSTransitionGroup'
import classNames from 'classnames';

const ModalInner = React.createClass({
  body: document.body,

  closeListener(e) {
    const { onClose } = this.props;
    // close modal when user hits escape
    if (e.which === 27) {
      e.preventDefault();
      onClose();
    }
  },

  componentDidMount() {
    this.body.classList.add('has-modal');
    window.addEventListener('keydown', this.closeListener);

    /*
     TODO: Remove this hack when IE10/11 usage is low enough
     Background: In IE10/11, because of a bug with their implementation of older revisions of the flexbox spec, the overflow:hidden on .modal isn't respected. Forcing a repaint fixes this.
     */
    if (document.documentMode === 10 || document.documentMode === 11) {
      let el = ReactDOM.findDOMNode(this.refs.modal);
      el.style.height = el.scrollHeight + 'px';
    }
  },

  componentWillUnmount() {
    this.body.classList.remove('has-modal');
    window.removeEventListener('keydown', this.closeListener);
  },

  render() {
    const { onClose, children, header, footer } = this.props;
    const headerClass = classNames('modal-top', { 'modal-top-hasHeader': !!header });
    const messageClass = classNames('modal-message', { 'modal-message-hasFooter': !!footer });
    const modalFooter = footer && <div className="modal-bottom">{footer}</div>;

    return (
      <div key="modal" className="modal-container">
        <div className="modal-overlay" onClick={onClose}></div>
        <div className="modal" ref="modal">
          <div className={headerClass}>
            {header}
            <div className="modal-close" onClick={onClose}></div>
          </div>
          <div className={messageClass}>{children}</div>
          {modalFooter}
        </div>
      </div>
    );
  }
});

let Modal = React.createClass({
  propTypes: {
    open: React.PropTypes.bool.isRequired,
    onClose: React.PropTypes.func.isRequired,
    header: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.node
    ])
  },

  render() {
    let modal = this.props.open && <ModalInner {...this.props}/>;

    return (
      <ReactCSSTransitionGroup
        transitionName="modal"
        transitionEnter={true}
        transitionEnterTimeout={250}
        transitionLeave={true}
        transitionLeaveTimeout={250}
        transitionAppear={false}>
        {modal}
      </ReactCSSTransitionGroup>
    );
  }

});

export default Modal
