import { Link } from 'react-router-dom';
import { BsArrowLeft } from 'react-icons/bs';
import React from 'react';


const BackButton = ({ destination = '/inventories' }) => {
  return (
    <div className='flex mt-8'>
      <Link to={destination} className='bg-black text-white px-1 py-1 rounded-lg w-fit m-2'>
        <BsArrowLeft className='text-3xl' />
      </Link>
    </div>
  );
};

export default BackButton;

