import React from 'react';
import '../../stylesheets/Sidebar.scss';
import baseTab from './BaseTab';

function InfoTab() {
  return (
    <div>
      <section>
        <p className="info-paragraph">
          Freesound Explorer is a visual interface for exploring Freesound content
          in a 2-dimensional space and for creating music :)
        </p>
      </section>
      <section>
        <p className="info-paragraph">
          Freesound Explorer is developed by Frederic Font and Giuseppe Bandiera at the
          Music Technology Group, Universitat Pompeu Fabra.
        </p>
      </section>
    </div>
  );
}

export default baseTab('About...', InfoTab);