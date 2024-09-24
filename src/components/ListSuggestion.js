"use client";

import { List, ListItem, ListItemText } from "@mui/material";

const ListSuggestions = ({ addlocation, listRef, listSuggestLocation }) => {
  return (
    <List
      ref={listRef}
      className="absolute left-0 top-[60px] bg-white z-50 border border-gray-200 shadow-md"
    >
      {listSuggestLocation.map((item, idx) => (
        <ListItem
          button
          key={idx}
          onClick={() => addlocation(item?.structured_formatting?.main_text)}
        >
          <ListItemText primary={item.description} />
        </ListItem>
      ))}
    </List>
  );
};
export default ListSuggestions;
