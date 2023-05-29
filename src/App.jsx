import './App.css';
import { useState, useEffect } from 'react';
import Semester from './components/Semester/Semester';
import subjects from './subjects';

const bachelors = [
    {
        id: 0,
        code: 'C09066',
        name: 'Bachelor of Engineering (Honours)',
        courseCP: 198,
    },
    {
        id: 1,
        code: 'C09067',
        name: 'Bachelor of Business',
        courseCP: 164,
    },
];

const courseMajors = [{ code: 'MAJ03523', name: 'Software Engineering' }];

const commencementSeason = [
    { id: 0, season: 'Autumn' },
    { id: 1, season: 'Spring' },
];

const App = () => {
    const [bachelorSelected, setBachelorSelected] = useState(
        bachelors[0].courseCP
    );
    const [selectedSemester, setSelectedSemester] = useState(0);
    const [selectedSubject, setSelectedSubject] = useState(subjects[0].id);
    const [numSemesters, setNumSemesters] = useState(6); // Set to 6 semester for 3 year course
    const [semesters, setSemesters] = useState(Array(numSemesters).fill([])); // Initialises based on numSemesters
    const [totalCreditPoints, setTotalCreditPoints] = useState(0);
    const [startingSemester, setStartingSemester] = useState(0);
    const [semesterNames, setSemesterNames] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSelectedbachelorCP = (e) => {
        setBachelorSelected(e.target.value);
    };

    // Handle Adding a Subject
    const addSubjectToSemester = () => {
        const newSemesters = [...semesters];
        const subject = subjects.find((sub) => sub.id === selectedSubject);

        // Calculates the total credit points in the selected semester
        const totalCpInSemester = newSemesters[selectedSemester].reduce(
            (total, sub) => total + sub.creditPoints,
            0
        );

        // Check if adding the subject would exceed 24 credit points cap in a semester
        if (totalCpInSemester + subject.creditPoints > 24) {
            setErrorMsg(
                `Adding ${subject.name} would exceed the 24 Credit Points limit for a single semester.`
            );
            return;
        }

        // Check if the subject can be added based on remaining credit points of the course
        if (bachelorSelected - totalCreditPoints - subject.creditPoints < 0) {
            setErrorMsg(
                `Adding ${subject.name} would exceed the Total Credit Points for this course.`
            );
            return;
        }

        // Checks if a pre-requisite has been taken before adding the subject
        if (subject.requisites) {
            let requisiteMet = false;
            for (let i = 0; i < selectedSemester; i++) {
                if (
                    newSemesters[i].find(
                        (sub) => sub.code === subject.requisites
                    )
                ) {
                    requisiteMet = true;
                    break;
                }
            }

            if (!requisiteMet) {
                setErrorMsg(
                    `${subject.name} cannot be added to ${semesterNames[selectedSemester]} because it requires ${subject.requisites} to be completed in a prior semester.`
                );
                return;
            }
        }

        // Checks if the subject availability matches the season it is being added into
        const semesterSeason =
            commencementSeason[(startingSemester + selectedSemester) % 2]
                .season;
        if (!subject.availability.includes(semesterSeason)) {
            setErrorMsg(
                `${subject.name} is not available in ${semesterSeason}.`
            );
            return;
        }

        const duplicateSemester = newSemesters.findIndex((semester) =>
            semester.find((sub) => sub.id === subject.id)
        );
        if (duplicateSemester !== -1) {
            setErrorMsg(
                `${subject.name} was already added to ${semesterNames[duplicateSemester]}.`
            );
        } else {
            newSemesters[selectedSemester] = [
                ...newSemesters[selectedSemester],
                subject,
            ];
            setSemesters(newSemesters);
            setTotalCreditPoints(totalCreditPoints + subject.creditPoints); // Updates total credit points
            setErrorMsg(''); // Clears the previous error message
        }
    };

    // Handle Removing a Subject
    const removeSubjectFromSemester = (subjectId, semesterIndex) => {
        const newSemesters = [...semesters];
        const subject = newSemesters[semesterIndex].find(
            (subject) => subject.id === subjectId
        );
        newSemesters[semesterIndex] = newSemesters[semesterIndex].filter(
            (sub) => sub.id !== subjectId
        );
        setSemesters(newSemesters);

        // Update total credit points
        setTotalCreditPoints(totalCreditPoints - subject.creditPoints);
    };

    // Resets the state of the Semester Array to clear items
    const clearSemesters = () => {
        setSemesters(Array(numSemesters).fill([])); // Re-initializes to chosen number of semesters
        setErrorMsg(''); // Clear any left over messages
        setTotalCreditPoints(0); // Reset total credit points
    };

    // Setting Semester Names
    useEffect(() => {
        const semesterNames = [];
        const currYear = new Date().getFullYear();
        for (let i = 0; i < numSemesters; i++) {
            let semesterYear = currYear + Math.floor(i / 2);
            const semesterSeason =
                commencementSeason[(startingSemester + i) % 2].season;

            /* This is to make sure that if Spring is the starting semester       *
             * the second semester should be Autumn of the next year hence year++ *
             * Starting Sem = 0 refers to Autumn and 1 is spring                  */
            if (startingSemester === 1 && i % 2 !== 0) {
                semesterYear++;
            }

            const semesterName = `${semesterSeason} ${semesterYear}`;
            semesterNames.push(semesterName);
        }
        setSemesterNames(semesterNames);
    }, [startingSemester, numSemesters]);
    /* Ensures that useEffect is called when the starting semester 
       or number of semesters is changed based on dependence array */

    // Separate useEffect to re-render semesters
    useEffect(() => {
        setSemesters(Array(numSemesters).fill([]));
    }, [numSemesters]);

    const handleStartingSemesterChange = (e) => {
        setStartingSemester(Number(e.target.value));
    };

    return (
        <div className='App'>
            <div className='side-container'>
                <div className='side-upper'>
                    <div className='side-heading'>
                        <div className='side-title'>
                            <h1> Settings </h1>
                        </div>
                        <button className='hamburger hamburger-in'>
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                    <div className='select-div'>
                        <select onChange={handleSelectedbachelorCP}>
                            {bachelors.map((el) => (
                                <option value={el.courseCP}>
                                    {el.code} {el.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='select-div'>
                        <select>
                            {courseMajors.map((el, index) => (
                                <option value={index}>
                                    {el.code} {el.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <h3> Choose Starting Semester </h3>
                    <div className='select-div'>
                        <select onChange={handleStartingSemesterChange}>
                            {commencementSeason.map((el) => (
                                <option value={el.id}>{el.season}</option>
                            ))}
                        </select>
                    </div>
                    <h3> Choose Number of Semesters </h3>
                    <div className='select-div'>
                        <select
                            onChange={(e) =>
                                setNumSemesters(Number(e.target.value))
                            }
                        >
                            {[...Array(16).keys()].slice(5).map((num) => (
                                <option value={num + 1}>{num + 1}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <h1> Subject Selection </h1>
                <div className='select-div'>
                    <select
                        onChange={(e) =>
                            setSelectedSubject(Number(e.target.value))
                        }
                    >
                        {subjects.map((subject) => (
                            <option value={subject.id}>
                                {subject.code} {subject.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className='select-div'>
                    <select
                        onChange={(e) =>
                            setSelectedSemester(Number(e.target.value))
                        }
                    >
                        {semesterNames.map((semester, index) => (
                            <option value={index}>{semester}</option>
                        ))}
                    </select>
                </div>
                <div className='button-container'>
                    <button
                        className='button button-add'
                        onClick={addSubjectToSemester}
                    >
                        Add Subject
                    </button>
                    <button
                        className='button button-clear'
                        onClick={clearSemesters}
                    >
                        Clear
                    </button>
                </div>
                <div className='info-container'>
                    <div className='info-block'>
                        Required Credit Points : {bachelorSelected}
                    </div>
                    <div className='info-block'>
                        Total Credit Points : {totalCreditPoints}
                    </div>
                    <div className='info-block'>
                        Remaining Credit Points :
                        {bachelorSelected - totalCreditPoints}
                    </div>
                </div>
            </div>
            <div className='semester-container'>
                {semesters
                    .slice(0, numSemesters)
                    .map((semesterSubjects, index) => (
                        <Semester
                            key={index}
                            semesterName={semesterNames[index]}
                            subjects={semesterSubjects}
                            onRemove={(subjectId) =>
                                removeSubjectFromSemester(subjectId, index)
                            }
                        />
                    ))}
                <div className='fix-last-item'></div>
                <div className='error-msg'>{errorMsg}</div>
            </div>
        </div>
    );
};

export default App;
