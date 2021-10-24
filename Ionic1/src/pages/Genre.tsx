import {dateToString, GenreProps} from "./MusicCommon";
import React from "react";
import {IonItem, IonLabel} from "@ionic/react";

interface GenrePropsExt extends GenreProps {
    onEdit: (id?: string) => void;
}

const Meal: React.FC<GenrePropsExt> = ({ id, name, dateAdded, onEdit }) => {
    return (
        <IonItem onClick={() => onEdit(id)}>
            <IonLabel>{name}. It was added on {dateToString(dateAdded)}</IonLabel>
        </IonItem>
    );
};

export default Meal;