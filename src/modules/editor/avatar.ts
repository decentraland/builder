import { env } from 'decentraland-commons'
import { Color4, Wearable } from 'decentraland-ecs'
import { WearableBodyShape } from 'modules/item/types'
import { WearableCategory } from '../item/types'
import _allWearables from './wearables/all.json'
export const PEER_URL = env.get('REACT_APP_PEER_URL', '')

export const allWearables: Wearable[] = (_allWearables as Wearable[]).map((wearable: Wearable) => ({
  ...wearable,
  baseUrl: wearable.baseUrl.replace('{peer-url}', PEER_URL)
}))

export function getSkinColors() {
  return [
    new Color4(1, 0.8941177, 0.7764706, 1),
    new Color4(1, 0.8666667, 0.7372549, 1),
    new Color4(0.9490196, 0.7607843, 0.6470588, 1),
    new Color4(0.8666667, 0.6941177, 0.5607843, 1),
    new Color4(0.8, 0.6078432, 0.4666667, 1),
    new Color4(0.6039216, 0.4627451, 0.3568628, 1),
    new Color4(0.4392157, 0.3647059, 0.2784314, 1),
    new Color4(0.4392157, 0.2980392, 0.2196078, 1),
    new Color4(0.3215686, 0.172549, 0.1098039, 1),
    new Color4(0.2352941, 0.1333333, 0.08627451, 1)
  ]
}

export function getHairColors() {
  return [
    new Color4(0.1098039, 0.1098039, 0.1098039, 1),
    new Color4(0.2352941, 0.1294118, 0.04313726, 1),
    new Color4(0.3568628, 0.1921569, 0.05882353, 1),
    new Color4(0.4823529, 0.282353, 0.09411765, 1),
    new Color4(0.5960785, 0.372549, 0.2156863, 1),
    new Color4(0.5490196, 0.1254902, 0.07843138, 1),
    new Color4(0.9137255, 0.509804, 0.2039216, 1),
    new Color4(1, 0.7450981, 0.1568628, 1)
  ]
}

export function getEyeColors() {
  return [
    new Color4(0.2117647, 0.1490196, 0.1490196, 1),
    new Color4(0.372549, 0.2235294, 0.1960784, 1),
    new Color4(0.5254902, 0.3803922, 0.2588235, 1),
    new Color4(0.7490196, 0.6196079, 0.3529412, 1),
    new Color4(0.5294118, 0.5019608, 0.4705882, 1),
    new Color4(0.6862745, 0.772549, 0.7803922, 1),
    new Color4(0.1254902, 0.7019608, 0.9647059, 1),
    new Color4(0.2235294, 0.4862745, 0.6901961, 1),
    new Color4(0.282353, 0.8627451, 0.4588235, 1),
    new Color4(0.2313726, 0.6235294, 0.3137255, 1)
  ]
}

export function getWearables(category: WearableCategory, bodyShape: WearableBodyShape) {
  return allWearables.filter(
    wearable =>
      wearable.category === category &&
      wearable.representations.some(representation => representation.bodyShapes.some(_bodyShape => _bodyShape === bodyShape))
  )
}

export function findWearable(id: string) {
  return allWearables.find(wearable => wearable.id === id)
}
