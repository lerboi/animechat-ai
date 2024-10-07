import Card from './Card';

const HomePage = ({ cards }) => {
  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {cards.map((card, index) => (
        <Card key={index} card={card} />
      ))}
    </div>
  );
};

export default HomePage;
