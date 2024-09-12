import express from 'express';
import Track from '../Models/Track';
import {TrackMutation} from '../types';
import mongoose from 'mongoose';
import Album from '../Models/Album';


const trackRouter = express.Router();

trackRouter.get('/', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {album, artist} = req.query;
    let tracks;

    if (artist) {
      const albums = await Album.find({artist: artist}).select('_id');
      const albumId = albums.map(album => album._id);
      tracks = await Track.find({album: {$in: albumId}}).populate({
        path: 'album',
        populate: {path: 'artist', select: 'title'}
      }).sort({track_number: 1});
    } else if (album) {
      tracks = await Track.find({album: album}).populate({
        path: 'album',
        populate: { path: 'artist', select: 'title' },
        select: 'title artist created_at image',
      }).sort({track_number: 1});
    } else {
      tracks = await Track.find().sort({track_number: 1})
    }

    return res.send(tracks);
  } catch (e) {
    return next(e);
  }
});


trackRouter.post('/', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const trackMutation: TrackMutation = {
      album: req.body.album,
      title: req.body.title,
      duration: req.body.duration,
      track_number: req.body.track_number
    }
    const track = new Track(trackMutation);
    await track.save();
    return res.send(track)
  } catch (e) {
    if (e instanceof mongoose.Error.ValidationError) {
      return res.status(400).send(e)
    }
    next(e)
  }
})


export default trackRouter;