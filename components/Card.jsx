
const Card = ({ card }) => {
  return (
    <div className="bg-[#1f1e1e] text-[#e7e7e7] p-4 rounded">
      <h3>{card.title}</h3>
      <p>{card.description}</p>
    </div>
  );
};

export default Card;
