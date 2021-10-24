import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import { GenreProvider } from './pages/MusicProvider';
import EditGenre from './pages/EditGenre';
import GenreList from './pages/MusicList';

const App: React.FC = () => (
  <IonApp>
    <GenreProvider>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/genres" component={GenreList} exact={true} />
          <Route path="/genre" component={EditGenre} exact={true} />
          <Route path="/genre/:id" component={EditGenre} exact={true} />
          <Route exact path="/" render={() => <Redirect to="/genres" />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </GenreProvider>
  </IonApp>
);

export default App;
