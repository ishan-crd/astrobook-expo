import { useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import axios from 'axios';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBmEP5a5at63KESOSjFAO_R8vTW6VzuuqA';

export default function PlaceInput({ onSelect, value, containerStyle, inputStyle, iconColor, disabled = false }) {
  const [query, setQuery] = useState(value ?? '');
  const [results, setResults] = useState([]);

  useEffect(() => {
    setQuery(value ?? '');
  }, [value]);

  const searchPlaces = async (text) => {
    if (disabled) return;
    setQuery(text);

    if (text.length < 2) {
      setResults([]);
      return;
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${GOOGLE_MAPS_API_KEY}`;
      const res = await axios.get(url);
      setResults(res.data.predictions || []);
    } catch (e) {
      console.log('Place search error:', e);
      setResults([]);
    }
  };

  const selectPlace = async (place) => {
    setQuery(place.description);
    setResults([]);

    try {
      const detailURL = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&key=${GOOGLE_MAPS_API_KEY}`;
      const res = await axios.get(detailURL);
      const loc = res.data.result.geometry.location;

      onSelect({
        description: place.description,
        latitude: loc.lat,
        longitude: loc.lng,
      });
    } catch (e) {
      console.log('Place details error:', e);
      // Still call onSelect with description only
      onSelect({
        description: place.description,
        latitude: 0,
        longitude: 0,
      });
    }
  };

  return (
    <View>
      <View style={containerStyle}>
        <MaterialCommunityIcons name="map-marker" size={20} color={iconColor || '#db9a4a'} />
        <TextInput
          value={query}
          editable={!disabled}
          placeholder="Enter place of birth"
          placeholderTextColor="#999"
          onChangeText={searchPlaces}
          style={inputStyle}
        />
      </View>

      {results.length > 0 && (
        <View style={dropdownStyles.dropdown}>
          {results.map((item) => (
            <TouchableOpacity key={item.place_id} onPress={() => selectPlace(item)}>
              <Text style={dropdownStyles.item}>{item.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const dropdownStyles = StyleSheet.create({
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginTop: 6,
    maxHeight: 180,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5D5C8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#2C1810',
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
});
