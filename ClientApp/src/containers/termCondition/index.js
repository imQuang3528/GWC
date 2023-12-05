import Modal from "../modal";

const TermCondition = ({ termCondition, ...rest }) => {
  return <Modal title="Terms & Conditions" content={termCondition} {...rest} />;
};

export default TermCondition;
