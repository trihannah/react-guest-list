import './App.css';
import React, { useEffect, useRef, useState } from 'react';

function Guest(props) {
  return (
    <div data-test-id="guest" className="guest-container">
      <strong>First name:</strong> {props.firstName} &nbsp;
      <strong>Last name:</strong> {props.lastName} &nbsp;
      <label>
        <input
          type="checkbox"
          checked={props.attending}
          onChange={() => props.ChangeAttending(props.id)}
          id={`attending-${props.id}`}
          aria-label={`${props.firstName} ${props.lastName} Attending Status`}
        />
        Attending
      </label>
      <button
        className="remove-button"
        onClick={() => props.RemoveGuest(props.id)}
      >
        Remove
      </button>
    </div>
  );
}

export default function App() {
  const [guests, setGuests] = useState([
    {
      id: 1,
      firstName: 'Jasmine',
      lastName: 'Marchitto',
      attending: false,
    },
    {
      id: 2,
      firstName: 'Kory',
      lastName: 'Privott',
      attending: true,
    },
    {
      id: 3,
      firstName: 'Rhett',
      lastName: 'Bluitt',
      attending: true,
    },
  ]);

  const baseUrl = 'http://localhost:4000';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const RemoveGuest = (id) => {
    const updatedGuests = guests.filter((guest) => guest.id !== id);
    setGuests(updatedGuests);
  };

  const ChangeAttending = (id) => {
    const updatedGuests = guests.map((guest) => {
      if (guest.id === id) {
        return { ...guest, attending: !guest.attending };
      }
      return guest;
    });
    setGuests(updatedGuests);
  };

  const lastNameInputRef = useRef(null);

  const AddGuest = (e) => {
    if (e.key === 'Enter' && firstName && lastName) {
      const newGuest = {
        id: guests.length + 1,
        firstName: firstName,
        lastName: lastName,
        attending: false,
      };

      fetch(`${baseUrl}/guests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGuest),
      })
        .then((response) => response.json())
        .then((createdGuest) => {
          setGuests([...guests, createdGuest]);
        })
        .catch((error) => {
          console.error('Error creating guest:', error);
        });

      setFirstName('');
      setLastName('');
    }
  };

  useEffect(() => {
    fetch(`${baseUrl}/guests`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setGuests(data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const UpdateGuestAttending = (id, attendingStatus) => {
    fetch(`${baseUrl}/guests/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ attending: attendingStatus }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to update guest.');
        }
      })
      .then((updatedGuest) => {
        const updatedGuests = guests.map((guest) => {
          if (guest.id === updatedGuest.id) {
            return updatedGuest;
          }
          return guest;
        });
        setGuests(updatedGuests);
      })
      .catch((error) => {
        console.error('Error updating guest:', error);
      });
  };

  const DeleteGuest = (id) => {
    fetch(`${baseUrl}/guests/${id}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (response.ok) {
          const updatedGuests = guests.filter((guest) => guest.id !== id);
          setGuests(updatedGuests);
        } else {
          console.error('Failed to delete guest.');
        }
      })
      .catch((error) => {
        console.error('Error deleting guest:', error);
      });
  };

  return (
    <div className="App">
      <h1>Guestlist</h1>
      <div className="input-container">
        <div className="name-input">
          <label htmlFor="firstNameInput">First name:</label>
          <input
            id="firstNameInput"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onKeyDown={AddGuest}
            placeholder="first name"
          />
        </div>
        <div className="name-input">
          <label htmlFor="lastNameInput">Last name:</label>
          <input
            id="lastNameInput"
            ref={lastNameInputRef}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onKeyDown={AddGuest}
            placeholder="last name"
          />
        </div>
      </div>

      <ul className="guest-list-container">
        {guests.map((guest) => (
          <li key={`guest-${guest.id}`} className="guest-item">
            <div className="guest-details">
              <Guest
                id={guest.id}
                firstName={guest.firstName}
                lastName={guest.lastName}
                attending={guest.attending}
                RemoveGuest={RemoveGuest}
                ChangeAttending={ChangeAttending}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
