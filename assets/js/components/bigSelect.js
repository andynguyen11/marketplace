import React from 'react';

const BigSelect = React.createClass({
    propType: {
        prefix: React.PropTypes.string,
        suffix: React.PropTypes.string,
        onSelect: React.PropTypes.func.isRequired,
        options: React.PropTypes.array.isRequired,
        selectedOptionIndex: React.PropTypes.array.isRequired,
        name: React.PropTypes.string,
        id: React.PropTypes.string,
    },

    componentWillMount() {
        const { selectedOptionIndex } = this.props;

        this.setState({ selectedOptionIndex });
    },

    onSelectChange(event) {
        const { options, onSelect } = this.props;
        const value = event.target.value;
        const selectedOptionIndex = options.indexOf(value);

        this.setState({ selectedOptionIndex });
        onSelect && onSelect(value);
    },

    render() {
        const { className, prefix, suffix, options, name, id } = this.props;
        const { selectedOptionIndex } = this.state;

        const bigSelectClass = 'bigSelect' + (className && ' ' + className || '');
        const prefixComponent = prefix && <div className="bigSelect-prefix">{prefix}</div>;
        const suffixComponent = suffix && <div className="bigSelect-suffix">{suffix}</div>;
        const selectOptions = options.map((option, i) => {
            return <option key={i} value={option}>{option}</option>;
        });
        const selectedOption = options[selectedOptionIndex];
        const optionsList = (
            <div className="bigSelect-options">
                <div className="bigSelect-selector">{selectedOption}</div>
                <i className="fa fa-angle-down"></i>
                <select name={name} id={id} value={selectedOption} onChange={this.onSelectChange}>
                    {selectOptions}
                </select>
            </div>
        );

        return (
            <div className={bigSelectClass}>
                {prefixComponent}
                {optionsList}
                {suffixComponent}
            </div>
        );
    }
});

export default BigSelect;