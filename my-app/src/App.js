import React, {useState} from 'react';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  const similarity = (s1, s2) => {
    let longer = s1, shorter = s2;
    if (s1.length < s2.length) { 
      longer = s2; shorter = s1;
    }
    const longerLength = longer.length;
    if (longerLength === 0) 
      return 1.0;
    
    return (longerLength - editDistance(longer, shorter)) / longerLength;
  }

  const editDistance= (s1, s2) => {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    const costs = []
    for (var i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (var j = 0; j <= s2.length; j++) {
        if (i === 0)
          costs[j] = j;
        else if (j > 0) {
            let newValue = costs[j - 1];
            if (s1.charAt(i - 1) !== s2.charAt(j - 1))
              newValue = Math.min(Math.min(newValue, lastValue),
                  costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0)
        costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  const filterResults = (input, data) => {
    const filteredUsers = data.map(function (a) {
      var score = 0,
      constraints = [
        {
          keys: ['name'],
          fn: function (p, f) {
            for(var name of f.split(' ')){
              if (name.toLowerCase() === p.toLowerCase())
                return 1;
            }
            return 0;
          },
        },
        { keys: ['email', 'name'], fn: similarity },
      ];

      constraints.forEach(function (c) {
        c.keys.forEach(function (k) {
          score += c.fn(input, a[k]);
        });
      });
      return { score, ...a };
    })
    .filter(s => s.score > 0); // filter out irrelevant data

    //sort by score
    filteredUsers.sort((a, b) => b.score - a.score);
      
    setUsers(filteredUsers)
    setSelectedRows([]) //clear selection
  }

  const onTextChange = (e) => {
    const searchVal = e.target.value;
    fetch(`http://127.0.0.1:8080/?search=${searchVal}`)
      .then(res => res.json())
      .then(data => {
        filterResults(searchVal, data);
      })
      .catch(console.log);
  }

  const onClick = (row) => {
    const selRows = selectedRows.slice();
    if (!selectedRows.includes(row)) {
      //add to state
      selRows.push(row)
    } else {
      //remove from the state
      selRows.splice(selRows.indexOf(row), 1);
    }
    setSelectedRows(selRows)
  }

  return (
    <div>
      <input onChange={onTextChange}/>
      {users.map(contact => (
        <div className={selectedRows.includes(contact)
            ? 'selected'
            : undefined}
          onClick={() => onClick(contact)}
        >
          {`${contact.name} ${contact.email}`}
        </div>
      ))}
    </div>
  );
}

export default App;
