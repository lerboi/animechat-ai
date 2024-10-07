
const Card = ({ cards }) => {
  return (
    <div className="bg-[#1f1e1e] text-[#e7e7e7] p-4 rounded">
      <h3>{cards.title}</h3>
      <p>{cardcs.description}</p>
    </div>
  );
};

export default Card;
