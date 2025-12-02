import React from 'react';

const Header = ({ title }) => {
  return (
    <header className="bg-gray-800 text-white p-4">
      <h1 className="text-xl">{title}</h1>
    </header>
  );
};

export default Header;