import React, { forwardRef } from 'react';
import OverflowController from './OverflowController';

function Core({ value, ...rest }, ref) {
  return (
    <span ref={ref} {...rest}>
      {value}
    </span>
  );
}

const CoreForwardRef = forwardRef(Core);

export default function DefaultRenderer({
  value = '',
  noWrap = false,
}) {
  const coreComponent = <CoreForwardRef value={value} />;
  return noWrap ? (
    <OverflowController title={value}>
      {coreComponent}
    </OverflowController>
  ) : (
    coreComponent
  );
}
