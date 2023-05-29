import React from 'react';
import './Semester.css';

const Semester = ({ semesterName, subjects, onRemove }) => (
    <div className='semester'>
        <h2>{semesterName}</h2>
        {subjects.map((subject, index) => (
            <div key={index} className='subject'>
                <p className='subject-code'>{subject.code}</p>
                <p>{subject.name}</p>
                <p>{subject.creditPoints} CP </p>
                <button
                    className='button button-remove'
                    onClick={() => onRemove(subject.id)}
                >
                    Remove
                </button>
            </div>
        ))}
    </div>
);

export default Semester;
