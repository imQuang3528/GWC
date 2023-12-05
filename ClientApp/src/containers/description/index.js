import Modal from "../modal";

const Description = ({ description, ...rest }) => {
  return <Modal title="Description" content={description} {...rest} />;
};

export default Description;
