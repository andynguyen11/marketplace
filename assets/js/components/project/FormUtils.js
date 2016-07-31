import React from 'react'
import { Button, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';

export function BigFormGroup({label, children, className='col-md-8 col-md-offset-2'}){
    return (
        <FormGroup bsClass={`form-group ${className}`} >
            <ControlLabel>{label}</ControlLabel>
            {children}
        </FormGroup>
    )
}

export function toTitle(str=''){
    return str
        .replace(/([a-z][A-Z])/g, g => g[0] + ' ' + g[1])
        .replace(/^([a-zA-Z])| ([a-zA-Z])/g, g => g.toUpperCase())
}

